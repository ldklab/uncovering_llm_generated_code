const assign = require('object-assign');
const vary = require('vary');

const defaults = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

function isString(s) {
  return typeof s === 'string' || s instanceof String;
}

function isOriginAllowed(origin, allowedOrigin) {
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.some((ao) => isOriginAllowed(origin, ao));
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
}

const configureHeaders = {
  origin: (options, req) => {
    const requestOrigin = req.headers.origin;
    if (!options.origin || options.origin === '*') {
      return [['Access-Control-Allow-Origin', '*']];
    } else if (isString(options.origin)) {
      return [['Access-Control-Allow-Origin', options.origin], ['Vary', 'Origin']];
    } else {
      const isAllowed = isOriginAllowed(requestOrigin, options.origin);
      return [['Access-Control-Allow-Origin', isAllowed ? requestOrigin : false], ['Vary', 'Origin']];
    }
  },
  methods: (options) => ({
    key: 'Access-Control-Allow-Methods',
    value: Array.isArray(options.methods) ? options.methods.join(',') : options.methods,
  }),
  credentials: (options) => (options.credentials === true ? { key: 'Access-Control-Allow-Credentials', value: 'true' } : null),
  allowedHeaders: (options, req) => {
    const allowedHeaders = options.allowedHeaders || options.headers || req.headers['access-control-request-headers'];
    return [
      ['Access-Control-Allow-Headers', Array.isArray(allowedHeaders) ? allowedHeaders.join(',') : allowedHeaders],
      ['Vary', 'Access-Control-Request-Headers'],
    ].filter((header) => header[1]);
  },
  exposedHeaders: (options) => {
    if (!options.exposedHeaders) return null;
    const headers = Array.isArray(options.exposedHeaders) ? options.exposedHeaders.join(',') : options.exposedHeaders;
    return headers ? { key: 'Access-Control-Expose-Headers', value: headers } : null;
  },
  maxAge: (options) => (typeof options.maxAge === 'number' && { key: 'Access-Control-Max-Age', value: options.maxAge.toString() }),
};

function applyHeaders(headers, res) {
  headers.forEach(([key, value]) => {
    if (key === 'Vary' && value) {
      vary(res, value);
    } else if (value) {
      res.setHeader(key, value);
    }
  });
}

function cors(options, req, res, next) {
  const method = req.method?.toUpperCase();
  let headers = [
    ...configureHeaders.origin(options, req),
    configureHeaders.credentials(options),
    ...(method === 'OPTIONS'
      ? [
          configureHeaders.methods(options),
          ...configureHeaders.allowedHeaders(options, req),
          configureHeaders.maxAge(options),
        ]
      : [
          configureHeaders.exposedHeaders(options),
        ]),
  ].filter(Boolean);

  applyHeaders(headers, res);

  if (method === 'OPTIONS') {
    if (options.preflightContinue) {
      next();
    } else {
      res.statusCode = options.optionsSuccessStatus;
      res.setHeader('Content-Length', '0');
      res.end();
    }
  } else {
    next();
  }
}

function middlewareWrapper(o = {}) {
  const optionsCallback = typeof o === 'function' ? o : (_, cb) => cb(null, o);

  return function corsMiddleware(req, res, next) {
    optionsCallback(req, (err, options) => {
      if (err) {
        next(err);
      } else {
        const corsOptions = assign({}, defaults, options);
        const originCallback = typeof corsOptions.origin === 'function'
          ? corsOptions.origin
          : (origin, cb) => cb(null, corsOptions.origin);

        originCallback(req.headers.origin, (err2, origin) => {
          if (err2 || !origin) {
            next(err2);
          } else {
            corsOptions.origin = origin;
            cors(corsOptions, req, res, next);
          }
        });
      }
    });
  };
}

module.exports = middlewareWrapper;
