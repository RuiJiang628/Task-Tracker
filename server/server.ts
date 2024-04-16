import express from 'express';
import { createServer } from "http"
import bodyParser from 'body-parser';
import pino from 'pino';
import expressPinoLogger from 'express-pino-logger';
import { MongoClient, Db } from 'mongodb';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Issuer, Strategy, generators } from 'openid-client';
import passport from 'passport';
import cors from 'cors';
import { Strategy as CustomStrategy } from "passport-custom"
import { Server } from "socket.io";
import { gitlab } from './secrets';
import { User, Task } from './data';


const HOST = process.env.HOST || "127.0.0.1";
const DISABLE_SECURITY = !!process.env.DISABLE_SECURITY;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUrl);
const port = parseInt(process.env.PORT) || 8193;
let db: Db

const OPERATOR_GROUP_ID = "oidc-card-game"

// Express setup
const app = express();
const server = createServer(app)

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const logger = pino({ 
  transport: { 
    target: 'pino-pretty' 
  } 
});
app.use(expressPinoLogger({ logger }));
app.use(cors({ origin: "http://127.0.0.1:8080", credentials: true }));

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
  console.log("serializeUser", user)
  done(null, user)
})
passport.deserializeUser((user: any, done) => {
  done(null, user)
})

// set up Socket.IO
const io = new Server(server)

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

    app.get("/api/user", (req, res) => {
      res.json(req.user || {})
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