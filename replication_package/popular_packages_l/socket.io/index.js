markdown
// Install express and socket.io using npm
// npm install express socket.io

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serving a basic HTML file for client connection
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handling socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for client events
  socket.on('chat message', (msg) => {
    console.log('Message: ' + msg);

    // Broadcast the message to all clients
    io.emit('chat message', msg);
  });

  // Client disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

// Example HTML Client (index.html)
/*
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Chat</title>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    var socket = io();
    document.addEventListener("DOMContentLoaded", function() {
      var form = document.querySelector("form");
      var input = document.getElementById("m");
      var messages = document.querySelector("#messages");

      form.addEventListener("submit", function(e) {
        e.preventDefault();
        socket.emit("chat message", input.value);
        input.value = "";
        return false;
      });

      socket.on("chat message", function(msg) {
        var item = document.createElement("li");
        item.textContent = msg;
        messages.appendChild(item);
      });
    });
  </script>
</head>
<body>
  <ul id="messages"></ul>
  <form action="">
    <input id="m" autocomplete="off" /><button>Send</button>
  </form>
</body>
</html>
*/
