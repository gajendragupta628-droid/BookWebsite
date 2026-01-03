const pino = require('pino');
const { env } = require('../config/env');

// Create a shared logger instance
const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;

