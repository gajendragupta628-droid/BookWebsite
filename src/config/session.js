const session = require('express-session');
const MongoStore = require('connect-mongo');
const { env } = require('./env');

const sessionConfig = () => ({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  ...(env.NODE_ENV === 'test'
    ? {}
    : { store: MongoStore.create({ mongoUrl: env.MONGODB_URI, ttl: 60 * 60 * 24 * 7 }) }),
  cookie: {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'lax' : 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
});

module.exports = { sessionConfig };
