// This code sets up a simple chat application using Node.js with Express and Socket.IO.
// It serves an HTML page and handles real-time bidirectional event-based communication
// between the server and clients using WebSockets.

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize an Express application
const app = express();
// Create an HTTP server using the Express app
const server = http.createServer(app);
// Initialize a new instance of socket.io by passing the server
const io = new Server(server);

// Define a route handler for GET requests to the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Serve the HTML file to the client
});

// Set up event handlers to manage socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'chat message' events from the client
  socket.on('chat message', (msg) => {
    console.log('Message: ' + msg);

    // Broadcast the received message to all connected clients
    io.emit('chat message', msg);
  });

  // Handle socket disconnection event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the HTTP server on port 3000 and log a message to the console
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

// Example HTML Client served by this Node.js application (contents of index.html)
/*
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Chat</title>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    var socket = io();

    // Wait for the DOM to fully load before setting up event listeners
    document.addEventListener("DOMContentLoaded", function() {
      var form = document.querySelector("form");
      var input = document.getElementById("m");
      var messages = document.querySelector("#messages");

      // Handle the form submission event
      form.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent default form submission behavior
        socket.emit("chat message", input.value); // Send the input value as a message to the server
        input.value = ""; // Clear the input field
        return false;
      });

      // Listen for 'chat message' events from the server
      socket.on("chat message", function(msg) {
        var item = document.createElement("li");
        item.textContent = msg;
        messages.appendChild(item); // Add the received message to the message list
      });
    });
  </script>
</head>
<body>
  <ul id="messages"></ul> <!-- Element to display chat messages -->
  <form action="">
    <input id="m" autocomplete="off" /><button>Send</button> <!-- Input field and send button for messages -->
  </form>
</body>
</html>
*/
