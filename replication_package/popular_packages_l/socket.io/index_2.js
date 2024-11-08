// This Node.js application uses Express and Socket.io to set up a web server
// that allows real-time bidirectional event-based communication between web clients and server.

// Import the required modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express and create an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize a new instance of socket.io by passing the server (HTTP server).
const io = new Server(server);

// Define a route to serve an HTML file for the clients
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle clients connecting to the socket
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'chat message' events from clients
  socket.on('chat message', (msg) => {
    console.log('Message: ' + msg);

    // Broadcast the received message to all connected clients
    io.emit('chat message', msg);
  });

  // Log a message when a user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server on port 3000
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
        socket.emit("chat message", input.value); // Send message to server
        input.value = "";
        return false;
      });

      socket.on("chat message", function(msg) {
        var item = document.createElement("li");
        item.textContent = msg; // Display incoming message
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
