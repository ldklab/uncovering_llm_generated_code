const assign = require('object-assign');
const vary = require('vary');

const defaultOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function isOriginAllowed(origin, allowedOrigins) {
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.some(allowedOrigin => isOriginAllowed(origin, allowedOrigin));
  }
  if (isString(allowedOrigins)) {
    return origin === allowedOrigins;
  }
  if (allowedOrigins instanceof RegExp) {
    return allowedOrigins.test(origin);
  }
  return Boolean(allowedOrigins);
}

function configureOrigin(options, req) {
  const requestOrigin = req.headers.origin;
  const headers = [];
  const originOption = options.origin;

  if (!originOption || originOption === '*') {
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: '*',
    });
  } else if (isString(originOption)) {
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: originOption,
    });
    headers.push({
      key: 'Vary',
      value: 'Origin',
    });
  } else {
    const allowed = isOriginAllowed(requestOrigin, originOption);
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: allowed ? requestOrigin : false,
    });
    headers.push({
      key: 'Vary',
      value: 'Origin',
    });
  }
  return headers;
}

function configureMethods(options) {
  const methods = Array.isArray(options.methods) ? options.methods.join(',') : options.methods;
  return {
    key: 'Access-Control-Allow-Methods',
    value: methods,
  };
}

function configureCredentials(options) {
  if (options.credentials) {
    return {
      key: 'Access-Control-Allow-Credentials',
      value: 'true',
    };
  }
  return null;
}

function configureAllowedHeaders(options, req) {
  let allowedHeaders = options.allowedHeaders || options.headers;
  const headers = [];

  if (!allowedHeaders) {
    allowedHeaders = req.headers['access-control-request-headers'];
    headers.push({
      key: 'Vary',
      value: 'Access-Control-Request-Headers',
    });
  } else if (Array.isArray(allowedHeaders)) {
    allowedHeaders = allowedHeaders.join(',');
  }
  if (allowedHeaders) {
    headers.push({
      key: 'Access-Control-Allow-Headers',
      value: allowedHeaders,
    });
  }
  return headers;
}

function configureExposedHeaders(options) {
  let headers = options.exposedHeaders;
  if (Array.isArray(headers)) {
    headers = headers.join(',');
  }
  return headers ? {
    key: 'Access-Control-Expose-Headers',
    value: headers,
  } : null;
}

function configureMaxAge(options) {
  const maxAge = (typeof options.maxAge === 'number' ? options.maxAge : options.maxAge.toString());
  return maxAge ? {
    key: 'Access-Control-Max-Age',
    value: maxAge,
  } : null;
}

function applyHeaders(headers, res) {
  headers.forEach(header => {
    if (header) {
      if (Array.isArray(header)) {
        applyHeaders(header, res);
      } else if (header.key === 'Vary' && header.value) {
        vary(res, header.value);
      } else if (header.value) {
        res.setHeader(header.key, header.value);
      }
    }
  });
}

function cors(options, req, res, next) {
  const headers = [];
  const method = req.method.toUpperCase();

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
}

function middlewareWrapper(options) {
  const optionsCallback = typeof options === 'function' ? options : (req, cb) => cb(null, options);

  return function corsMiddleware(req, res, next) {
    optionsCallback(req, (err, options) => {
      if (err) {
        next(err);
      } else {
        const corsOpts = assign({}, defaultOptions, options);
        let originCallback = corsOpts.origin && typeof corsOpts.origin === 'function'
          ? corsOpts.origin
          : (origin, cb) => cb(null, corsOpts.origin);

        if (originCallback) {
          originCallback(req.headers.origin, (err, origin) => {
            if (err || !origin) {
              next(err);
            } else {
              corsOpts.origin = origin;
              cors(corsOpts, req, res, next);
            }
          });
        } else {
          next();
        }
      }
    });
  };
}

module.exports = middlewareWrapper;
