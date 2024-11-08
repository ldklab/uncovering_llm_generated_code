// Import Express
const express = require('express');

// Create Express application
const app = express();

// Middleware for serving static files
app.use(express.static('public'));

// Define routes (for informational purposes)
const routes = [
  { path: '/', name: 'Home', component: 'HomeComponent' },
  { path: '/about', name: 'About', component: 'AboutComponent' },
];

// Function to setup route handlers
function setupRoutes() {
  console.log('Setting up routes');

  // Define route for the home page
  app.get('/', (req, res) => {
    res.send('Welcome to the Home page');
  });

  // Define route for the about page
  app.get('/about', (req, res) => {
    res.send('Welcome to the About page');
  });
}

// Configure routes
setupRoutes();

// Define server port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
