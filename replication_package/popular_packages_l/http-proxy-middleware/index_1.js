// file: http-proxy-middleware.js
const http = require('http');
const httpProxy = require('http-proxy');

/**
 * Class representing a HTTP Proxy Middleware.
 */
class HttpProxyMiddleware {
  /**
   * Initialize a new instance of HttpProxyMiddleware.
   * @param {Object} options - Configuration options for the proxy.
   */
  constructor(options) {
    this.options = options;
    this.proxy = httpProxy.createProxyServer({});
    this.initializeEventHandlers();
  }

  /**
   * Configure event handlers based on options.
   */
  initializeEventHandlers() {
    const { on } = this.options;
    if (on) {
      for (const event in on) {
        if (on.hasOwnProperty(event)) {
          this.proxy.on(event, on[event]);
        }
      }
    }
  }

  /**
   * Function to handle incoming HTTP requests using the proxy.
   * @param {http.IncomingMessage} req - The incoming request object.
   * @param {http.ServerResponse} res - The outgoing response object.
   * @param {Function} next - Callback to pass control to the next middleware.
   */
  handleRequest(req, res, next) {
    const { target, changeOrigin } = this.options;

    req.url = req.originalUrl || req.url; // Maintain original URL
    const options = { target, changeOrigin };

    // Apply path rewriting rules if configured
    if (this.options.pathRewrite) {
      const pathRewrites = this.options.pathRewrite;
      req.url = req.url.replace(new RegExp(Object.keys(pathRewrites).join('|')), (matched) => {
        return pathRewrites[matched];
      });
    }

    // Forward request to target using proxy
    this.proxy.web(req, res, options, (err) => {
      if (err) {
        if (this.options.onError) {
          // Utilize custom error handling if provided
          return this.options.onError(err, req, res, target);
        }
        res.statusCode = 500;
        res.end('Proxy error');
      }
    });
  }

  /**
   * Handles WebSocket upgrade requests.
   * @param {http.IncomingMessage} req - The HTTP request object.
   * @param {Socket} socket - The network socket between the server and client.
   * @param {Buffer} head - The first packet of the upgraded stream.
   */
  handleUpgrade(req, socket, head) {
    const { target, changeOrigin } = this.options;
    this.proxy.ws(req, socket, head, { target, changeOrigin });
  }
}

/**
 * Factory function to generate a new instance of the proxy middleware.
 * @param {Object} options - Configuration settings for the proxy.
 * @returns {Function} Middleware function compatible with server frameworks.
 */
function createProxyMiddleware(options) {
  const middleware = new HttpProxyMiddleware(options);
  return (req, res, next) => middleware.handleRequest(req, res, next);
}

module.exports = { createProxyMiddleware };
