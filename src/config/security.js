const securityConfig = {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers (onerror, onclick, etc.)
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'], // Allow all external images
      fontSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", 'https:', 'http:'], // Allow API calls
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
};

module.exports = { securityConfig };

