const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server with various options
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:9000',  // target host to proxy to
  ws: true,  // enable websocket proxying
  changeOrigin: true,  // changes the origin of the host header to the target URL
  xfwd: true  // adds x-forward headers
});

// Listen to the `error` event on `proxy`.
proxy.on('error', (err, req, res) => {
  console.error('Proxy encountered an error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Something went wrong. Proxy error.');
});

// Optionally modify the proxy request before sending it.
proxy.on('proxyReq', (proxyReq, req, res, options) => {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

// Create a server that proxies your HTTP request
const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:9000' });
});

// Listen for the `upgrade` event on `server` and proxy WebSocket requests
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start the server on port 8000
server.listen(8000, () => {
  console.log('Proxy server is listening on http://localhost:8000');
});

// Create your target server
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9000, () => {
  console.log('Target server is listening on http://localhost:9000');
});
