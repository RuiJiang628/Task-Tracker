import express from 'express';
import { createServer } from "http"
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { MongoClient, Db } from 'mongodb'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { Issuer, Strategy, generators } from 'openid-client'
import passport from 'passport'
import cors from 'cors';
import { Strategy as CustomStrategy } from "passport-custom"
import { Server } from "socket.io"
import { gitlab } from './secrets'
import { User, Task } from './data'


const HOST = process.env.HOST || "127.0.0.1"
const DISABLE_SECURITY = !!process.env.DISABLE_SECURITY
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(mongoUrl)
const port = parseInt(process.env.PORT) || 8193
let db: Db

const OPERATOR_GROUP_ID = "oidc-card-game"

// Express setup
const app = express();
const server = createServer(app)
const io = new Server(server)

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const logger = pino({ 
  transport: { 
    target: 'pino-pretty' 
  } 
});
app.use(expressPinoLogger({ logger }));
// app.use(cors({ origin: "http://127.0.0.1:8080", credentials: true }));

const sessionMiddleware = session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017',
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
})

app.use(sessionMiddleware)
declare module 'express-session' {
  export interface SessionData {
    credits?: number
  }
}

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  // console.log("serializeUser", user)
  done(null, user)
})
passport.deserializeUser((user: any, done) => {
  done(null, user)
})

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next)
io.use(wrap(sessionMiddleware))

// // Express routes
// app.get('/api/login', passport.authenticate('oidc', { successReturnToOrRedirect: "/dashboard", failureRedirect: '/' }));
// app.get('/api/login-callback', passport.authenticate('oidc', { successReturnToOrRedirect: "/dashboard", failureRedirect: '/' }));

// Socket.IO events
io.on('connection', client => {
  const user = (client.request as any).session?.passport?.user
  logger.info("new socket connection for user " + JSON.stringify(user))
  if (!user) {
    client.disconnect()
    return
  }

  client.on('saveProfile', async (profileData) => {
    console.log("saveProfile", profileData)
    try {
      // Assuming profileData contains an 'id' to identify the user document
      const { _id, netID, ...updateData } = profileData;      

      // Update the user profile in the database
      const result = await db.collection('users').updateOne({ netID: netID }, { $set: updateData });

      if (result.modifiedCount === 0) {
        throw new Error('No document found with the given id or no changes made.');
      }
      // On successful update, emit a success event back to the client
      client.emit('profileSaved', { status: 'success' });
    } catch (error) {
      // If an error occurs, emit an error event back to the client
      console.error('Error saving profile:', error);
      client.emit('saveError', { status: 'error', error: error.message });
    }
  })

  client.on('addTask', async (taskData) => {
    try {
      const netID = (client.request as any).session.passport.user.nickname;
      const user = await db.collection('users').findOne({ netID: netID })
      if (!user) {
          client.emit('unauthorized', { message: 'User not found' });
          return;
      }
      // 创建新任务
      const newTask : Task = {
        taskID: user.tasks.length > 0 ? Math.max(...user.tasks.map((task: Task) => task.taskID)) + 1 : 0,
        ...taskData
      };

      // 使用 $push 操作符将新任务添加到用户的 tasks 数组
      const updateResult = await db.collection('users').updateOne(
          { netID: netID },
          { $push: { tasks: newTask} as any }
      );
      if (updateResult.matchedCount === 0) {
          client.emit('taskError', { message: 'No user found with given ID' });
          return;
      }
      if (updateResult.modifiedCount === 0) {
          client.emit('taskError', { message: 'Task could not be added' });
          return;
      }
      client.emit('taskAdded', { message: 'Task added successfully', task: newTask });
  } catch (error) {
      console.error('Error adding task:', error);
      client.emit('taskError', { message: 'Failed to add task', error: error.message });
    }
  })

  client.on('getTasks', async () => {
    if ((client.request as any).session.passport && (client.request as any).session.passport.user) {
      const netID = (client.request as any).session.passport.user.nickname;
      try {
        const user = await db.collection('users').findOne({ netID: netID })
        if (!user) {
          client.emit('unauthorized', { message: 'User not found' });
          return;
        }
        client.emit('tasksFetched', user.tasks); // 发送任务数据给客户端
      } catch (error) {
        console.error('Error fetching tasks:', error);
        client.emit('taskError', { message: 'Failed to fetch tasks' });
      }
    } else {
      client.emit('unauthorized', { message: 'User is not authenticated' });
    }
  })

  client.on('fetchAllUsers', async () => {
    const user = (client.request as any).session?.passport?.user;
    if (!user) {
      client.emit('unauthorized', { message: 'Authentication required' });
      return;
    }
    console.log("fetchAllUsers", user)
    // 假设用户信息中有 role 字段
    if (user.role !== 'admin') {
      client.emit('unauthorized', { message: 'Admin privileges required' });
      return;
    }
    try {
      const users = await db.collection('users').find({}).toArray(); // 获取非管理员用户
      client.emit('usersFetched', users);
    } catch (error) {
      client.emit('error', { message: 'Failed to fetch users', error: error.message });
    }
  })

})

// Connect to MongoDB and start the server
client.connect().then(async () => {
  logger.info('connected successfully to MongoDB')
  db = client.db("task_tracker")

  if (DISABLE_SECURITY) {
    passport.use("oidc", new CustomStrategy((req, done) => done(null, { preferred_username: req.query.user, role: req.query.role })))
  } else {
    const issuer = await Issuer.discover("https://coursework.cs.duke.edu/")
    const client = new issuer.Client(gitlab)

    const params = {
      scope: 'openid profile email',
      nonce: generators.nonce(),
      redirect_uri: `http://${HOST}:8080/api/login-callback`,
      state: generators.state(),
      // this forces a fresh login screen every time
      // prompt: "login",
    }

    async function verify(tokenSet: any, userInfo: any, done: any) {
      try{
        logger.info("oidc " + JSON.stringify(userInfo))
        const existingUser = await db.collection('users').findOne({ netID: userInfo.nickname }) || await db.collection('admins').findOne({ netID: userInfo.nickname });
        userInfo.role = userInfo.groups.includes(OPERATOR_GROUP_ID) ? "admin" : "user"
        
        if (!existingUser) {
          const newUser: User ={
            netID: userInfo.nickname,
            userName: userInfo.preferred_username,
            email: userInfo.email,
            gender: null,  
            birthDate: null, 
            tasks: [],
            role: userInfo.role
          }

          if (userInfo.role === "admin") {
            const insertResult = await db.collection('admins').insertOne(newUser);
            if (insertResult.acknowledged) {
              logger.info('New admin created with ID:', insertResult.insertedId);
            } else {
              logger.error('Failed to insert new admin');
            }
          } else {
            const insertResult = await db.collection('users').insertOne(newUser);
            if (insertResult.acknowledged) {
              io.emit('userUpdated', newUser);
              console.log("userUpdated", newUser)
              logger.info('New user created with ID:', insertResult.insertedId);
            } else {
              logger.error('Failed to insert new user');
            }
          }
        }
        return done(null, userInfo);
      } catch (error) {
        logger.error('Error in OIDC verification:', error);
        return done(error);
      }
    }

    passport.use('oidc', new Strategy({ client, params }, verify))

    app.get('/api/check-auth', (req, res) => {
      // Passport adds the isAuthenticated method to the request object
      if (req.isAuthenticated()) {
        // If the user is authenticated, return a successful response
        res.status(200).json({ message: 'User is authenticated' });
      } else {
        // If the user is not authenticated, return an unauthorized status
        res.status(401).json({ message: 'User is not authenticated' });
      }
    })

    app.get(
      "/api/login", 
      passport.authenticate("oidc", { failureRedirect: "/api/login" }), 
      (req, res) => res.redirect("/")
    )
    
      app.get("/api/login-callback",
      passport.authenticate("oidc", { failureRedirect: "/api/login" }),
      (req, res) => {
        // 检查用户的角色并决定重定向的URL
        console.log("login-callback", (req.user as User).role)
        if ((req.user as User).role === "admin") {
          res.redirect("/admin");
        } else {
          res.redirect("/dashboard");
        }
      }
    );

    app.get("/api/user", async (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: 'User is not authenticated' });
      }
    
      const netID = (req.user as any).nickname;
      try {
        const userInDb = await db.collection('users').findOne({ netID: netID })
        if (userInDb) {
          return res.json(userInDb);
        } else {
          return res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        console.error('Error fetching user from MongoDB', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    })

    app.get("/api/admin", async (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Admin is not authenticated' });
      }
      const netID = (req.user as any).nickname;
      try {
        const userInDb = await db.collection('admins').findOne({ netID: netID })
        if (userInDb) {
          return res.json(userInDb);
        } else {
          return res.status(404).json({ message: 'Admin not found' });
        }
      } catch (error) {
        console.error('Error fetching admin from MongoDB', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    })
    
    app.post(
      "/api/logout",
      (req, res, next) => {
        req.logout((err) => {
          if (err) {
            return next(err)
          }
          res.redirect("/")
        })
      }
    )
  }
    // start server
    server.listen(port)
    logger.info(`Task Tracker server listening on port ${port}`)
})