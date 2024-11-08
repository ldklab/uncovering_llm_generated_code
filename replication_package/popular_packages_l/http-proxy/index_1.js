const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server with options to forward requests to the target
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:9000',
  ws: true,
  changeOrigin: true,
  xfwd: true
});

// Handle any proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy encountered an error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong. Proxy error.');
});

// Modify proxy request to include custom header
proxy.on('proxyReq', (proxyReq) => {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

// Create HTTP server to proxy requests
const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:9000' });
});

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start the proxy server on port 8000
server.listen(8000, () => {
  console.log('Proxy server is listening on http://localhost:8000');
});

// Setup the target server to handle proxied requests
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Request successfully proxied!\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9000, () => {
  console.log('Target server is listening on http://localhost:9000');
});
