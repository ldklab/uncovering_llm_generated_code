// index.js
const express = require('express');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define routes and their handlers
app.get('/', (req, res) => {
  res.send('Welcome to the Home page');
});

app.get('/about', (req, res) => {
  res.send('Welcome to the About page');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
