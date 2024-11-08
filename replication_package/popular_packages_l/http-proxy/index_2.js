const http = require('http');
const httpProxy = require('http-proxy');

// Create and configure the proxy server
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:9000',
  ws: true,
  changeOrigin: true,
  xfwd: true
});

// Error handling for proxy server
proxy.on('error', (err, req, res) => {
  console.error('Proxy encountered an error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong. Proxy error.');
});

// Add custom header to proxy requests
proxy.on('proxyReq', (proxyReq, req, res, options) => {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

// Create a proxying HTTP server
const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:9000' });
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start proxy server on port 8000
server.listen(8000, () => {
  console.log('Proxy server is listening on http://localhost:8000');
});

// Target server that the proxy server forwards to
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Request successfully proxied!\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9000, () => {
  console.log('Target server is listening on http://localhost:9000');
});
