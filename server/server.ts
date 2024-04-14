import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { Issuer, Strategy, generators } from 'openid-client'
import passport from 'passport'
import { Strategy as CustomStrategy } from "passport-custom"
import cors from 'cors'
import { gitlab } from './secrets'

const HOST = process.env.HOST || "127.0.0.1"
const DISABLE_SECURITY = !!process.env.DISABLE_SECURITY

// set up Mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(mongoUrl)
let db: Db
let orders: Collection

// set up Express
const app = express()
const port = parseInt(process.env.PORT) || 8193

// set up body parsing for both JSON and URL encoded
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up Pino logging
const logger = pino({ transport: { target: 'pino-pretty' } })
app.use(expressPinoLogger({ logger }))

// set up CORS
app.use(cors({
  origin: "http://127.0.0.1:8080",
  credentials: true,
}))

// set up session
app.use(session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017',
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
}))

declare module 'express-session' {
  export interface SessionData {
    credits?: number
  }
}

app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user: any, done) => {
  console.log("serializeUser", user)
  done(null, user)
})
passport.deserializeUser((user: any, done) => {
  console.log("deserializeUser", user)
  done(null, user)
})

app.get('/api/login', passport.authenticate('oidc', {
  successReturnToOrRedirect: "/dashboard"
}))

app.get('/api/login-callback', passport.authenticate('oidc', {
  successReturnToOrRedirect: "/dashboard",
  failureRedirect: '/'
}))

// connect to Mongo
client.connect().then(async () => {
  logger.info('connected successfully to MongoDB')
  db = client.db("test")
  orders = db.collection('orders')

  if (DISABLE_SECURITY) {
    passport.use("oidc", new CustomStrategy((req, done) => done(null, { preferred_username: req.query.user, roles: req.query.role })))
  } else {
    const issuer = await Issuer.discover("https://coursework.cs.duke.edu/")
    const client = new issuer.Client(gitlab)

    const params = {
      scope: 'openid profile email',
      nonce: generators.nonce(),
      redirect_uri: `http://${HOST}:8080/api/login-callback`,
      state: generators.state(),

      // this forces a fresh login screen every time
      prompt: "login",
    }

    async function verify(tokenSet: any, userInfo: any, done: any) {
      logger.info("oidc " + JSON.stringify(userInfo))
      // console.log('userInfo', userInfo)
      // userInfo.roles = userInfo.groups.includes(OPERATOR_GROUP_ID) ? ["operator"] : ["customer"]
      return done(null, userInfo)
    }

    passport.use('oidc', new Strategy({ client, params }, verify))
  }

  app.listen(port, () => {
    console.log(`Task tracker server listening on port ${port}`)
  })
})
