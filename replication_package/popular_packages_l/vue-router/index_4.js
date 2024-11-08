const express = require('express');
const app = express();

// Middleware for serving static files from 'public' directory
app.use(express.static('public'));

// Preset application routes (currently not utilized directly)
const routes = [
  { path: '/', name: 'Home', component: 'HomeComponent' },
  { path: '/about', name: 'About', component: 'AboutComponent' },
];

// Function to define routes and handle requests
function initializeRoutes() {
  console.log('Listening for route changes.');

  app.get('/', (req, res) => {
    res.send('Welcome to the Home page');
  });

  app.get('/about', (req, res) => {
    res.send('Welcome to the About page');
  });
}

// Set up routes
initializeRoutes();

// Start the server and listen on the defined port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
