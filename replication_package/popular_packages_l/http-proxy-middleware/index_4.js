// file: http-proxy-middleware.js

const http = require('http');
const { createProxyServer } = require('http-proxy');

class HttpProxyMiddleware {
  constructor(options) {
    this.options = options; // Store configuration options
    this.proxy = createProxyServer({}); // Instantiate a new proxy server
    this.configureProxyEvents(); // Set up event listeners based on provided options
  }

  configureProxyEvents() {
    const { on } = this.options;
    if (on) {
      // Bind custom event handlers if provided in options
      for (const event in on) {
        if (on.hasOwnProperty(event)) {
          this.proxy.on(event, on[event]);
        }
      }
    }
  }

  middleware(req, res, next) {
    const { target, changeOrigin, pathRewrite, onError } = this.options;
    
    req.url = req.originalUrl || req.url; // Preserve the original URL
    const proxyOptions = { target, changeOrigin };

    if (pathRewrite) {
      // Apply path rewrite logic if specified
      req.url = req.url.replace(
        new RegExp(Object.keys(pathRewrite).join('|')),
        matched => pathRewrite[matched]
      );
    }

    // Proxy the web request and handle any errors that occur
    this.proxy.web(req, res, proxyOptions, err => {
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
    this.proxy.ws(req, socket, head, { target, changeOrigin }); // Support WebSockets
  }
}

function createProxyMiddleware(options) {
  const proxyMiddlewareInstance = new HttpProxyMiddleware(options); // Create an instance of the middleware
  return (req, res, next) => {
    proxyMiddlewareInstance.middleware(req, res, next); // Wrap the middleware function for use in a server
  };
}

module.exports = { createProxyMiddleware }; // Export the middleware factory function
