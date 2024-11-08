// cors.js

'use strict';

module.exports = function cors(options) {
  return function(req, res, next) {
    const defaultOptions = {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    const corsOptions = { ...defaultOptions, ...options };
    
    const origin = determineOrigin(corsOptions, req, res, next);

    if (corsOptions.origin === true || origin === req.header('Origin')) {
      setCorsHeaders(res, req, corsOptions);
    }

    if (req.method === 'OPTIONS') {
      if (corsOptions.preflightContinue) {
        return next();
      } else {
        res.sendStatus(corsOptions.optionsSuccessStatus);
      }
    } else {
      next();
    }
  };
};

function determineOrigin(corsOptions, req, res, next) {
  if (typeof corsOptions.origin === 'function') {
    return corsOptions.origin(req.header('Origin'), (err, allow) => handleOriginCallback(err, allow, res, next, corsOptions));
  } else {
    return corsOptions.origin;
  }
}

function handleOriginCallback(err, allow, res, next, options) {
  if (err) {
    next(err);
  } else if (allow) {
    setCorsHeaders(res, {}, options);
    next();
  } else {
    res.sendStatus(403);
  }
}

function setCorsHeaders(res, req, options) {
  res.header('Access-Control-Allow-Origin', options.origin || '*');
  res.header('Access-Control-Allow-Methods', options.methods);
  if (options.credentials) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  if (options.allowedHeaders) {
    res.header('Access-Control-Allow-Headers', Array.isArray(options.allowedHeaders) ? options.allowedHeaders.join(',') : options.allowedHeaders);
  } else {
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
  }
  if (options.exposedHeaders) {
    res.header('Access-Control-Expose-Headers', Array.isArray(options.exposedHeaders) ? options.exposedHeaders.join(',') : options.exposedHeaders);
  }
  if (options.maxAge) {
    res.header('Access-Control-Max-Age', options.maxAge.toString());
  }
}
