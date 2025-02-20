// file: http-proxy-middleware.js
const http = require('http');
const httpProxy = require('http-proxy');

class HttpProxyMiddleware {
  /**
   * Create a new proxy middleware.
   * Initialize options and set up the proxy server with event bindings.
   * @param {Object} options - The configuration options for the proxy.
   */
  constructor(options) {
    this.options = options;
    this.proxy = httpProxy.createProxyServer({});
    this.bindEvents();
  }

  /**
   * Bind custom event listeners to the proxy server.
   * These events can be specified in the options to customize behavior.
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
   * Handle incoming requests and proxy them to the target server.
   * Supports URL path rewriting and error handling.
   * @param {http.IncomingMessage} req - The incoming HTTP request.
   * @param {http.ServerResponse} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   */
  middleware(req, res, next) {
    const { target, changeOrigin, pathRewrite, onError } = this.options;
    
    req.url = req.originalUrl || req.url; // Preserve the original URL
    const options = { target, changeOrigin };

    // Perform path rewriting if specified in the options
    if (pathRewrite) {
      req.url = req.url.replace(new RegExp(Object.keys(pathRewrite).join('|')), (matched) => {
        return pathRewrite[matched];
      });
    }

    // Forward request via proxy, handle any errors using onError or default handling
    this.proxy.web(req, res, options, (err) => {
      if (err) {
        if (onError) {
          return onError(err, req, res, target);
        }
        res.statusCode = 500;
        res.end('Proxy error');
      }
    });
  }

  /**
   * Handle WebSocket upgrade requests for proxying WebSockets.
   * @param {http.IncomingMessage} req - The incoming HTTP request.
   * @param {Socket} socket - The network socket.
   * @param {Buffer} head - The initial data packet.
   */
  upgrade(req, socket, head) {
    const { target, changeOrigin } = this.options;
    this.proxy.ws(req, socket, head, { target, changeOrigin });
  }
}

/**
 * Factory function to create a proxy middleware instance.
 * Configures the instance with the provided options and returns a middleware function.
 * @param {Object} options - The configuration options for the proxy.
 * @returns {Function} Middleware function suitable for use in HTTP servers.
 */
function createProxyMiddleware(options) {
  const proxyMiddleware = new HttpProxyMiddleware(options);
  return (req, res, next) => {
    proxyMiddleware.middleware(req, res, next);
  };
}

module.exports = { createProxyMiddleware };
