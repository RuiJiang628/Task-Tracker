import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import { MongoClient, Db, ObjectId } from "mongodb";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Issuer, Strategy, generators } from "openid-client";
import passport from "passport";
import cors from "cors";
import { Strategy as CustomStrategy } from "passport-custom";
import { Server } from "socket.io";
import { gitlab } from "./secrets";
import { User, Task } from "./data";
// import dotenv from 'dotenv';
// const result = dotenv.config({ path: '../.env' });

const HOST = process.env.HOST || "127.0.0.1";
const DISABLE_SECURITY = process.env.DISABLE_SECURITY;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const client = new MongoClient(mongoUrl);
const port = parseInt(process.env.PORT) || 8193;
// const port = 8193;
let db: Db;

const passportStrategies = [
  ...(DISABLE_SECURITY ? ["disable-security"] : []),
  "oidc",
]

const OPERATOR_GROUP_ID = "oidc-card-game";

// Express setup
const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
app.use(expressPinoLogger({ logger }));
app.use(cors({ origin: "http://127.0.0.1:31000/", credentials: true }));

const sessionMiddleware = session({
  secret: "a just so-so secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  store: MongoStore.create({
    mongoUrl: mongoUrl,
    ttl: 14 * 24 * 60 * 60, // 14 days
  }),
});

app.use(sessionMiddleware);
declare module "express-session" {
  export interface SessionData {
    credits?: number;
  }
}

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  // console.log("serializeUser", user)
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware: any) => (socket: any, next: any) =>
  middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Socket.IO events
io.on("connection", (client) => {
  const user = (client.request as any).session?.passport?.user;
  const netID = user?.nickname;
  if (netID) {
    client.join(netID); 
  } else {
    client.emit("unauthorized", { message: "User is not authenticated" });
    client.disconnect();
  }
  logger.info("new socket connection for user " + JSON.stringify(user));
  if (!user) {
    client.disconnect();
    return;
  }
  io.emit("userConnected", user);

  client.on("saveProfile", async (profileData) => {
    console.log("saveProfile", profileData);
    const { _id, version, ...updateData } = profileData;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(_id), version: version },
      { $set: updateData, $inc: { version: 1 } }
    );

    if (result.modifiedCount === 0) {
        console.error("Error saving profile: No user found with the given ID or version mismatch.");
        client.emit("saveError", { status: "error", message: "Update failed due to version mismatch or user not found." });
        return;
    }

    const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(_id) });
    client.emit("profileSaved", updatedUser);
  });


  client.on("addTask", async (taskData) => {
    try {
      const netID = (client.request as any).session.passport.user.nickname;
      const user = await db.collection("users").findOne({ netID: netID });
      if (!user) {
        client.emit("unauthorized", { message: "User not found" });
        return;
      }
      const newTask: Task = {
        taskID:
          user.tasks.length > 0
            ? Math.max(...user.tasks.map((task: Task) => task.taskID)) + 1
            : 0,
        ...taskData,
      };

      // Add the new task to the user's tasks array
      const updateResult = await db
        .collection("users")
        .updateOne({ netID: netID }, { $push: { tasks: newTask } as any });
      if (updateResult.matchedCount === 0) {
        client.emit("taskError", { message: "No user found with given ID" });
        return;
      }
      if (updateResult.modifiedCount === 0) {
        client.emit("taskError", { message: "Task could not be added" });
        return;
      }
      io.to(netID).emit("taskAdded", {
        message: "Task added successfully",
        task: newTask,
      });
    } catch (error) {
      console.error("Error adding task:", error);
      client.emit("taskError", {
        message: "Failed to add task",
        error: error.message,
      });
    }
  });

  // Get tasks event
  client.on("getTasks", async () => {
    if (
      (client.request as any).session.passport &&
      (client.request as any).session.passport.user
    ) {
      const netID = (client.request as any).session.passport.user.nickname;
      try {
        const user = await db.collection("users").findOne({ netID: netID });
        if (!user) {
          client.emit("unauthorized", { message: "User not found" });
          return;
        }
        client.emit("tasksFetched", user.tasks); 
      } catch (error) {
        console.error("Error fetching tasks:", error);
        client.emit("taskError", { message: "Failed to fetch tasks" });
      }
    } else {
      client.emit("unauthorized", { message: "User is not authenticated" });
    }
  })

  client.on("updateTaskStatus", async (taskData) => {
    try {
      const netID = (client.request as any).session.passport.user.nickname;
      const { taskID, checked } = taskData;

      const updateResult = await db
        .collection("users")
        .updateOne(
          { netID: netID, "tasks.taskID": taskID },
          { $set: { "tasks.$.checked": checked } }
        );

      if (updateResult.modifiedCount === 0) {
        throw new Error("No task was updated.");
      }
      io.to(netID).emit("taskUpdated", { taskID, status: "success" });
    } catch (error) {
      console.error("Error updating task status:", error);
      client.emit("taskError", {
        message: "Failed to update task",
        error: error.message,
      });
    }
  });

  // Update task event
  client.on("updateTask", async (taskData) => {
    try {
      const { taskID, title, description, version } = taskData;
      const netID = (client.request as any).session.passport.user.nickname;

      // Update the task in MongoDB
      const filter = {
        netID: netID, 
        tasks: { $elemMatch: { taskID: taskID, version: version } }
      };
      const update = {
        $set: {
          "tasks.$.title": title,
          "tasks.$.description": description
        },
        $inc: { "tasks.$.version": 1 }  // Increment the task's version number
      };
      const updateResult = await db.collection("users").updateOne(filter, update);
      if (updateResult.matchedCount === 0) {
        throw new Error("No task matches the provided taskID and version, update failed.");
      }
      client.emit("taskUpdated", { message: "Task successfully updated." });
    } catch (error) {
      client.emit("taskError", {
        message: "Failed to update task",
        error: error.message,
      });
    }
  });

  client.on("deleteTask", async ({ taskID }) => {
    try {
      const netID = (client.request as any).session.passport.user.nickname;
      const updateResult = await db
        .collection<User>("users")
        .updateOne(
          { netID: netID, "tasks.taskID": taskID },
          { $pull: { tasks: { taskID: taskID } } }
        );
      if (updateResult.modifiedCount === 0) {
        throw new Error("Task not found or user not authenticated.");
      }
      io.to(netID).emit("taskDeleted", { taskID: taskID, status: "success" });
    } catch (error) {
      console.error("Error deleting task:", error);
      client.emit("taskError", {
        message: "Failed to delete task",
        error: error.message,
      });
    }
  })

  client.on("deleteAllTasks", async (taskData) => {
    try {
      const netID = (client.request as any).session.passport.user.nickname;
      let updateQuery = {};

      switch (taskData.status) {
        case "All":
          updateQuery = { $set: { tasks: [] } }; // delete all tasks
          break;
        case "Active":
          updateQuery = { $pull: { tasks: { checked: false } } }; // delete all active tasks
          break;
        case "Completed":
          updateQuery = { $pull: { tasks: { checked: true } } }; // delete all completed tasks
          break;
      }

      const result = await db.collection("users").updateOne(
        { netID: netID },
        updateQuery // delete all tasks
      );

      if (result.modifiedCount === 0) {
        throw new Error("No tasks were deleted or user not found.");
      }

      client.emit("allTasksDeleted");
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      client.emit("taskError", {
        message: "Failed to delete all tasks",
        error: error.message,
      });
    }
  });

  client.on('fetchAllUsers', async () => {
    const user = (client.request as any).session?.passport?.user;
    if (!user) {
      client.emit('unauthorized', { message: 'Authentication required' });
      return;
    }
    console.log("fetchAllUsers", user)
    if (user.role !== 'admin' && !user.roles.includes('admin')) {
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

  client.on('updateUser', async (userData) => {
    try {
      const { _id, version, ...updateData } = userData;
      const collection = db.collection('users');
      const result = await collection.updateOne(
        { _id: new ObjectId(_id), version: version },
        { $set: updateData, $inc: { version: 1 } }
      );
      if (result.modifiedCount === 0) {
        throw new Error('No user found with the given ID or version mismatch');
      }
      const updatedUser = await collection.findOne({ _id: new ObjectId(_id) });
      client.emit('userUpdated', updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      client.emit('updateError', { message: error.message });
    }
  });
})

app.get(
  "/api/login",
  passport.authenticate(passportStrategies, { failureRedirect: "/api/login"}),
  (req, res) => {
    const { key, user, role } = req.query;
    if (req.query.key !== DISABLE_SECURITY) { res.redirect("/dashboard") }
    else {
      if (role=="admin"){
        res.redirect("/admin");
      } else {
        res.redirect("/dashboard");
      }
    }
  }
)

app.get(
  "/api/login-callback", 
  passport.authenticate(passportStrategies, { failureRedirect: "/api/login" }),
  (req, res) => {
    console.log("login-callback", (req.user as User).role);
    if ((req.user as User).role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/dashboard");
    }
  }
);

app.get("/api/user", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User is not authenticated" });
  }

  const netID = (req.user as any).nickname;
  try {
    const userInDb = await db.collection("users").findOne({ netID: netID });
    if (userInDb) {
      return res.json(userInDb);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user from MongoDB", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/admin", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Admin is not authenticated" });
  }
  const netID = (req.user as any).nickname;
  try {
    const userInDb = await db
      .collection("admins")
      .findOne({ netID: netID });
    if (userInDb) {
      return res.json(userInDb);
    } else {
      return res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    console.error("Error fetching admin from MongoDB", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

client.connect().then(async () => {
  logger.info("connected successfully to MongoDB");
  db = client.db("task_tracker");

  passport.use("disable-security", new CustomStrategy((req, done) => {
    if (req.query.key !== DISABLE_SECURITY) {
      console.log("you must supply ?key=" + DISABLE_SECURITY + " to log in via DISABLE_SECURITY")
      done(null, false)
    } else {
      done(null, { nickname: req.query.user, roles: [].concat(req.query.role) })
    }
  }))
  
  {
    const issuer = await Issuer.discover("https://coursework.cs.duke.edu/");
    const client = new issuer.Client(gitlab);

    const params = {
      scope: "openid profile email",
      nonce: generators.nonce(),
      redirect_uri: `http://127.0.0.1:31000/api/login-callback`,
      state: generators.state(),
    };

    async function verify(tokenSet: any, userInfo: any, done: any) {
      try {
        logger.info("oidc " + JSON.stringify(userInfo));
        const existingUser =
          (await db
            .collection("users")
            .findOne({ netID: userInfo.nickname })) ||
          (await db.collection("admins").findOne({ netID: userInfo.nickname }));
        userInfo.role = userInfo.groups.includes(OPERATOR_GROUP_ID)
          ? "admin"
          : "user";

        if (!existingUser) {
          const newUser: User = {
            netID: userInfo.nickname,
            userName: userInfo.preferred_username,
            email: userInfo.email,
            gender: null,
            birthDate: null,
            tasks: [],
            role: userInfo.role,
            version: 0,
          };

          if (userInfo.role === "admin") {
            const insertResult = await db
              .collection("admins")
              .insertOne(newUser);
            if (insertResult.acknowledged) {
              logger.info(
                "New admin created with ID:",
                insertResult.insertedId
              );
            } else {
              logger.error("Failed to insert new admin");
            }
          } else {
            const insertResult = await db
              .collection("users")
              .insertOne(newUser);
            if (insertResult.acknowledged) {
              io.emit('usersUpdated', newUser);
              console.log("usersUpdated", newUser)
              logger.info('New user created with ID:', insertResult.insertedId);
            } else {
              logger.error("Failed to insert new user");
            }
          }
        }
        return done(null, userInfo);
      } catch (error) {
        logger.error("Error in OIDC verification:", error);
        return done(error);
      }
    }
    passport.use("oidc", new Strategy({ client, params }, verify));
  }

  // start server
  server.listen(port);
  logger.info(`Task Tracker server listening on port ${port}`);
});
