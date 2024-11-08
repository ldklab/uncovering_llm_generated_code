// server.js
const http = require('http');
const React = require('react');
const { renderToPipeableStream } = require('react-dom/server');
const { createElement } = React;

function App() {
  return createElement('div', null, 'Hello World');
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const stream = renderToPipeableStream(createElement(App), {
      onShellReady() {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write('<!DOCTYPE html><html><body>');
        stream.pipe(res, { end: false });
        stream.on('end', () => res.end('</body></html>'));
      },
      onError(error) {
        console.error(error);
        res.statusCode = 500;
        res.end('Internal Server Error');
      },
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

// client.js
import React from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function App() {
  return React.createElement('div', null, 'Hello World');
}

root.render(React.createElement(App));
