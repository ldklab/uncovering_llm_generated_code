'use strict';

const assign = require('object-assign');
const vary = require('vary');

const defaults = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const isString = (s) => typeof s === 'string' || s instanceof String;

const isOriginAllowed = (origin, allowedOrigin) => {
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.some(o => isOriginAllowed(origin, o));
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
};

const configureOrigin = (options, req) => {
  const requestOrigin = req.headers.origin;
  const headers = [];
  let isAllowed;

  if (!options.origin || options.origin === '*') {
    headers.push([{ key: 'Access-Control-Allow-Origin', value: '*' }]);
  } else if (isString(options.origin)) {
    headers.push([{ key: 'Access-Control-Allow-Origin', value: options.origin }]);
    headers.push([{ key: 'Vary', value: 'Origin' }]);
  } else {
    isAllowed = isOriginAllowed(requestOrigin, options.origin);
    headers.push([{ key: 'Access-Control-Allow-Origin', value: isAllowed ? requestOrigin : false }]);
    headers.push([{ key: 'Vary', value: 'Origin' }]);
  }

  return headers;
};

const configureMethods = (options) => {
  let methods = options.methods;
  if (methods.join) {
    methods = methods.join(',');
  }
  return { key: 'Access-Control-Allow-Methods', value: methods };
};

const configureCredentials = (options) => {
  return options.credentials ? { key: 'Access-Control-Allow-Credentials', value: 'true' } : null;
};

const configureAllowedHeaders = (options, req) => {
  let allowedHeaders = options.allowedHeaders || options.headers;
  const headers = [];

  if (!allowedHeaders) {
    allowedHeaders = req.headers['access-control-request-headers'];
    headers.push([{ key: 'Vary', value: 'Access-Control-Request-Headers' }]);
  } else if (allowedHeaders.join) {
    allowedHeaders = allowedHeaders.join(',');
  }
  if (allowedHeaders && allowedHeaders.length) {
    headers.push([{ key: 'Access-Control-Allow-Headers', value: allowedHeaders }]);
  }

  return headers;
};

const configureExposedHeaders = (options) => {
  let headers = options.exposedHeaders;
  if (!headers) return null;
  if (headers.join) headers = headers.join(',');
  return headers.length ? { key: 'Access-Control-Expose-Headers', value: headers } : null;
};

const configureMaxAge = (options) => {
  const maxAge = options.maxAge?.toString() || null;
  return maxAge?.length ? { key: 'Access-Control-Max-Age', value: maxAge } : null;
};

const applyHeaders = (headers, res) => {
  headers.forEach(header => {
    if (Array.isArray(header)) {
      applyHeaders(header, res);
    } else if (header.key === 'Vary' && header.value) {
      vary(res, header.value);
    } else if (header.value) {
      res.setHeader(header.key, header.value);
    }
  });
};

const cors = (options, req, res, next) => {
  const headers = [];
  const method = req.method?.toUpperCase();

  if (method === 'OPTIONS') {
    headers.push(configureOrigin(options, req));
    headers.push(configureCredentials(options));
    headers.push(configureMethods(options));
    headers.push(configureAllowedHeaders(options, req));
    headers.push(configureMaxAge(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, res);

    if (options.preflightContinue) {
      next();
    } else {
      res.statusCode = options.optionsSuccessStatus;
      res.setHeader('Content-Length', '0');
      res.end();
    }
  } else {
    headers.push(configureOrigin(options, req));
    headers.push(configureCredentials(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, res);
    next();
  }
};

const middlewareWrapper = (o) => {
  const optionsCallback = typeof o === 'function' ? o : (req, cb) => cb(null, o);
  return (req, res, next) => {
    optionsCallback(req, (err, options) => {
      if (err) {
        next(err);
      } else {
        const corsOptions = assign({}, defaults, options);
        const originCallback = corsOptions.origin
          ? typeof corsOptions.origin === 'function'
            ? corsOptions.origin
            : (origin, cb) => cb(null, corsOptions.origin)
          : null;

        if (originCallback) {
          originCallback(req.headers.origin, (err2, origin) => {
            if (err2 || !origin) {
              next(err2);
            } else {
              corsOptions.origin = origin;
              cors(corsOptions, req, res, next);
            }
          });
        } else {
          next();
        }
      }
    });
  };
};

module.exports = middlewareWrapper;
