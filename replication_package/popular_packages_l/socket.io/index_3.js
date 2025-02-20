const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Route to serve the index.html file to the client
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Event handler for a new client connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'chat message' events from the client
  socket.on('chat message', (msg) => {
    console.log('Message: ' + msg);

    // Emit the received message to all connected clients
    io.emit('chat message', msg);
  });

  // Event handler for client disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Server listening on port 3000
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

// Example static HTML Client (index.html)
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
        e.preventDefault(); // Prevent form from submitting the default way
        socket.emit("chat message", input.value);
        input.value = ""; // Clear the input field
        return false;
      });

      // Listen for 'chat message' events to update message list
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
