const { body, query, param, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.validationErrors = errors.array();
  }
  next();
};

module.exports = { body, query, param, handleValidation };

