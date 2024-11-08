const http = require('http');
const httpProxy = require('http-proxy');

class HttpProxyMiddleware {
  constructor(options) {
    this.options = options;
    this.proxy = httpProxy.createProxyServer({});
    this.bindEvents();
  }

  bindEvents() {
    const { on } = this.options;
    if (on) {
      for (const event in on) {
        if (on.hasOwnProperty(event)) {
          this.proxy.on(event, on[event]);
        }
      }
    }
  }

  middleware(req, res, next) {
    const { target, changeOrigin, pathRewrite, onError } = this.options;

    req.url = req.originalUrl || req.url;
    const options = { target, changeOrigin };

    if (pathRewrite) {
      const pathRewriter = new RegExp(Object.keys(pathRewrite).join('|'));
      req.url = req.url.replace(pathRewriter, (matched) => pathRewrite[matched]);
    }

    this.proxy.web(req, res, options, (err) => {
      if (err) {
        if (onError) {
          onError(err, req, res, target);
        } else {
          res.statusCode = 500;
          res.end('Proxy error');
        }
      }
    });
  }

  upgrade(req, socket, head) {
    const { target, changeOrigin } = this.options;
    this.proxy.ws(req, socket, head, { target, changeOrigin });
  }
}

function createProxyMiddleware(options) {
  const proxyMiddleware = new HttpProxyMiddleware(options);
  return function(req, res, next) {
    proxyMiddleware.middleware(req, res, next);
  };
}

module.exports = { createProxyMiddleware };
