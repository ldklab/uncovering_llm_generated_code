// index.js
const express = require('express');
const app = express();

// Middleware to serve static files
app.use(express.static('public'));

// Basic routing functionality
const routes = [
  { path: '/', name: 'Home', component: 'HomeComponent' },
  { path: '/about', name: 'About', component: 'AboutComponent' },
];

// Function to mimic client's route handling
function useRouter() {
  console.log('Listening for route changes');

  app.get('/', (req, res) => {
    res.send('Welcome to the Home page');
  });

  app.get('/about', (req, res) => {
    res.send('Welcome to the About page');
  });
}

// Initialize fake router
useRouter(); 

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
