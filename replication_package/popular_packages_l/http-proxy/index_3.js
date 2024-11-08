const http = require('http');
const httpProxy = require('http-proxy');

// Setup target server
const targetServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Request successfully proxied!\n' + JSON.stringify(req.headers, null, 2));
}).listen(9000, () => {
  console.log('Target server is listening on http://localhost:9000');
});

// Configure proxy server options
const proxyOptions = {
  target: 'http://localhost:9000',
  ws: true,
  changeOrigin: true,
  xfwd: true
};

// Initialize the proxy server
const proxyServer = httpProxy.createProxyServer(proxyOptions);

// Handle proxy error events
proxyServer.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong. Proxy error.');
});

// Modify proxy request with additional headers
proxyServer.on('proxyReq', (proxyReq, req, res) => {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

// Create HTTP server to route requests through proxy
const server = http.createServer((req, res) => {
  proxyServer.web(req, res);
});

// Enable WebSocket request handling
server.on('upgrade', (req, socket, head) => {
  proxyServer.ws(req, socket, head);
});

// Start the proxy server
server.listen(8000, () => {
  console.log('Proxy server is listening on http://localhost:8000');
});
