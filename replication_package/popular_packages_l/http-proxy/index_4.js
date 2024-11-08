const http = require('http');
const httpProxy = require('http-proxy');

// Set up a proxy server
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:9000',
  ws: true,
  changeOrigin: true,
  xfwd: true
});

// Error handling for the proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy encountered an error.');
});

// Add a custom header to proxied requests
proxy.on('proxyReq', (proxyReq, req, res, options) => {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

// Set up the main server to handle HTTP requests
const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:9000' });
});

// Handle WebSocket requests
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start the proxy server
server.listen(8000, () => {
  console.log('Proxy server running at http://localhost:8000');
});

// Start the target server
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Request proxied successfully:\n' + JSON.stringify(req.headers, null, 2));
  res.end();
}).listen(9000, () => {
  console.log('Target server running at http://localhost:9000');
});
