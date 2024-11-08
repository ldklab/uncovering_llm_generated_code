'use strict';

module.exports = function cors(userOptions = {}) {
  return function(req, res, next) {
    const defaultOptions = {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    const finalOptions = { ...defaultOptions, ...userOptions };

    const requestOrigin = req.header('Origin');
    const originHandler = (typeof finalOptions.origin === 'function') 
      ? finalOptions.origin 
      : () => finalOptions.origin;

    originHandler(requestOrigin, createOriginHandler(res, next, finalOptions));

    if (req.method === 'OPTIONS') {
      if (finalOptions.preflightContinue) {
        return next();
      }
      return res.sendStatus(finalOptions.optionsSuccessStatus);
    }
    
    next();
  };
};

function setCorsHeaders(res, req, options) {
  res.header('Access-Control-Allow-Origin', options.origin || '*');
  res.header('Access-Control-Allow-Methods', options.methods);
  if (options.credentials) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  const allowedHeaders = options.allowedHeaders || req.header('Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Headers', Array.isArray(allowedHeaders) ? allowedHeaders.join(',') : allowedHeaders);
  if (options.exposedHeaders) {
    res.header('Access-Control-Expose-Headers', Array.isArray(options.exposedHeaders) ? options.exposedHeaders.join(',') : options.exposedHeaders);
  }
  if (options.maxAge) {
    res.header('Access-Control-Max-Age', `${options.maxAge}`);
  }
}

function createOriginHandler(res, next, options) {
  return function(err, isAllowed) {
    if (err) {
      return next(err);
    }
    if (isAllowed) {
      setCorsHeaders(res, {}, options);
      return next();
    }
    res.sendStatus(403);
  };
}
