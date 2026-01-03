// Attach csrfToken to locals for forms
module.exports.attachCSRFToken = (req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (e) {
    // ignore if not present
    res.locals.csrfToken = null;
  }
  next();
};

