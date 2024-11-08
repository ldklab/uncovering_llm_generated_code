// file: http-proxy-middleware.js
const http = require('http');
const httpProxy = require('http-proxy');

class HttpProxyMiddleware {
  /**
   * Create a new proxy middleware.
   * @param {Object} options The configuration options for the proxy.
   */
  constructor(options) {
    this.options = options;
    this.proxy = httpProxy.createProxyServer({});
    this.bindEvents();
  }

  /**
   * Bind events to the proxy to allow for custom behavior.
   */
  bindEvents() {
    const { on } = this.options;
    if (on) {
      Object.keys(on).forEach(event => {
        this.proxy.on(event, on[event]);
      });
    }
  }

  /**
   * Middleware function to handle requests.
   * @param {http.IncomingMessage} req The incoming HTTP request.
   * @param {http.ServerResponse} res The HTTP response object.
   * @param {Function} next The next middleware function.
   */
  middleware(req, res, next) {
    const { target, changeOrigin } = this.options;
    
    req.url = req.originalUrl || req.url; // Ensure original URL is retained
    const options = { target, changeOrigin };

    // Use path rewrites if specified
    if (this.options.pathRewrite) {
      req.url = req.url.replace(new RegExp(Object.keys(this.options.pathRewrite).join('|')), (matched) => {
        return this.options.pathRewrite[matched];
      });
    }

    this.proxy.web(req, res, options, (err) => {
      if (err) {
        if (this.options.onError) {
          return this.options.onError(err, req, res, target);
        }
        res.statusCode = 500;
        res.end('Proxy error');
      }
    });
  }

  /**
   * Upgrade handler for WebSocket support.
   * @param {http.IncomingMessage} req The incoming HTTP request.
   * @param {Socket} socket The network socket between the server and client.
   * @param {Buffer} head The first packet of the upgraded stream.
   */
  upgrade(req, socket, head) {
    const { target, changeOrigin } = this.options;
    this.proxy.ws(req, socket, head, { target, changeOrigin });
  }
}

/**
 * Factory function to create a proxy middleware.
 * @param {Object} options The configuration options for the proxy.
 * @returns Middleware function to be used in server applications.
 */
function createProxyMiddleware(options) {
  const proxyMiddleware = new HttpProxyMiddleware(options);
  return (req, res, next) => {
    proxyMiddleware.middleware(req, res, next);
  };
}

module.exports = { createProxyMiddleware };
