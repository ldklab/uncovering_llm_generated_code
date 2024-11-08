// cors.js

'use strict';

module.exports = function cors(options = {}) {
  return function(req, res, next) {
    const defaultOptions = {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    const corsOptions = { ...defaultOptions, ...options };

    const determineOrigin = (originCallback) => (
      typeof corsOptions.origin === 'function' ?
        corsOptions.origin(req.header('Origin'), originCallback) :
        corsOptions.origin
    );

    const handleOriginCheck = (err, allow) => {
      if (err) return next(err);
      if (allow) setCorsHeaders(res, {}, corsOptions);
      if (!allow) return res.sendStatus(403);
      next();
    };

    const origin = determineOrigin(handleOriginCheck);

    if (corsOptions.origin === true || origin === req.header('Origin')) {
      setCorsHeaders(res, req, corsOptions);
    }

    if (req.method === 'OPTIONS') {
      corsOptions.preflightContinue ? next() : res.sendStatus(corsOptions.optionsSuccessStatus);
    } else {
      next();
    }
  };
};

function setCorsHeaders(res, req, options) {
  res.header('Access-Control-Allow-Origin', options.origin || '*');
  res.header('Access-Control-Allow-Methods', options.methods);

  if (options.credentials) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  const allowHeaders = options.allowedHeaders || req.header('Access-Control-Request-Headers');
  if (allowHeaders) {
    res.header('Access-Control-Allow-Headers', Array.isArray(allowHeaders) ? allowHeaders.join(',') : allowHeaders);
  }

  if (options.exposedHeaders) {
    res.header('Access-Control-Expose-Headers', Array.isArray(options.exposedHeaders) ? options.exposedHeaders.join(',') : options.exposedHeaders);
  }

  if (options.maxAge) {
    res.header('Access-Control-Max-Age', options.maxAge.toString());
  }
}
