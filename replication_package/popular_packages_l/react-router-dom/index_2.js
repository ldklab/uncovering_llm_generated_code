// index.js
const express = require('express');
const app = express();

// Serve the initial HTML page with a root element and script reference
app.get('/', (req, res) => {
  res.send(`
    <div id="root"></div>
    <script src="bundle.js"></script>
  `);
});

// Start the Express server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// router-dom.js
module.exports = {
  BrowserRouter: function (props) {
    return `<div>${props.children}</div>`;
  },
  Route: function ({ path, component: Component }) {
    const pathname = window.location.pathname;
    if (pathname === path) {
      return `<div>${Component()}</div>`;
    }
    return null;
  },
  Link: function ({ to, children }) {
    return `<a href="${to}" onclick="event.preventDefault(); window.history.pushState({}, '', '${to}'); renderApp();">${children}</a>`;
  },
  Switch: function ({ children }) {
    for (let element of children) {
      if (element) return element;
    }
    return null;
  }
};

// bundle.js (simulated in server, normally separate)
const rootElement = document.getElementById('root');

// Components representing different pages
function Home() {
  return 'Home Page';
}

function About() {
  return 'About Page';
}

// Main App component using custom router logic
function App() {
  return `
    ${BrowserRouter({
      children: `
        ${Link({ to: '/', children: 'Home' })}
        ${Link({ to: '/about', children: 'About' })}
        ${Switch({
          children: [
            Route({ path: '/', component: Home }),
            Route({ path: '/about', component: About }),
          ]
        })}
    `})
  }`;
}

// Function to render the application into the root element
function renderApp() {
  rootElement.innerHTML = App();
}

// Initial render
renderApp();
