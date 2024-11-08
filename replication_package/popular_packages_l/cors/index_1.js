'use strict';

// Export CORS middleware
module.exports = function cors(userOptions) {
  // Middleware returning function
  return function(req, res, next) {
    // Default settings
    const defaults = {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    // Combine user and default options
    const settings = { ...defaults, ...userOptions };

    // Determine if request's origin is allowed
    const origin = typeof settings.origin === 'function' ?
      settings.origin(req.header('Origin'), configureOrigin(res, next, settings)) :
      settings.origin;

    // If origin matches, set headers
    if (settings.origin === true || origin === req.header('Origin')) {
      configureHeaders(res, req, settings);
    }

    // Handle OPTIONS (preflight) requests
    if (req.method === 'OPTIONS') {
      // Either continue or send status based on settings
      if (settings.preflightContinue) {
        next();
      } else {
        res.sendStatus(settings.optionsSuccessStatus);
      }
    } else {
      // For other methods, proceed
      next();
    }
  };
};

// Function to configure response headers for CORS
function configureHeaders(res, req, settings) {
  res.header('Access-Control-Allow-Origin', settings.origin || '*');
  res.header('Access-Control-Allow-Methods', settings.methods);
  
  if (settings.credentials) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (settings.allowedHeaders) {
    res.header('Access-Control-Allow-Headers', Array.isArray(settings.allowedHeaders) ? settings.allowedHeaders.join(',') : settings.allowedHeaders);
  } else {
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
  }
  
  if (settings.exposedHeaders) {
    res.header('Access-Control-Expose-Headers', Array.isArray(settings.exposedHeaders) ? settings.exposedHeaders.join(',') : settings.exposedHeaders);
  }
  
  if (settings.maxAge) {
    res.header('Access-Control-Max-Age', settings.maxAge.toString());
  }
}

// Callback function creation for custom origin handling
function configureOrigin(res, next, settings) {
  return function (err, allow) {
    if (err) {
      next(err); // Pass errors
    } else if (allow) {
      configureHeaders(res, {}, settings); // Set headers if allowed
      next();
    } else {
      res.sendStatus(403); // Deny access if not allowed
    }
  };
}
