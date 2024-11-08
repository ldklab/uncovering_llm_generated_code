const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (clientSocket) => {
  console.log('Client connected');

  clientSocket.on('chat message', (message) => {
    console.log('Received: ' + message);
    io.emit('chat message', message);
  });

  clientSocket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

httpServer.listen(3000, () => {
  console.log('Running on port 3000');
});
