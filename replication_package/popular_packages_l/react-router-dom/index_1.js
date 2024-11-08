// index.js
const express = require('express');
const { BrowserRouter, Route, Link, Switch } = require('./router-dom');

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <div id="root"></div>
    <script src="bundle.js"></script>
  `);
});

// Start Express server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// router-dom.js
module.exports = {
  BrowserRouter: function ({ children }) {
    return `<div>${children}</div>`;
  },
  Route: function ({ path, component: Component }) {
    const currentPath = window.location.pathname;
    return currentPath === path ? `<div>${Component()}</div>` : '';
  },
  Link: function ({ to, children }) {
    return `<a href="${to}" onclick="window.history.pushState({}, '', '${to}'); return false;">${children}</a>`;
  },
  Switch: function ({ children }) {
    for (const element of children) {
      if (element) return element;
    }
    return null;
  }
};

// bundle.js
const rootElement = document.getElementById('root');

function Home() {
  return 'Home Page';
}

function About() {
  return 'About Page';
}

function App() {
  return BrowserRouter({
    children: `
      ${Link({ to: '/', children: 'Home' })}
      ${Link({ to: '/about', children: 'About' })}
      ${Switch({
        children: [
          Route({ path: '/', component: Home }),
          Route({ path: '/about', component: About }),
        ]
      })}
    `
  });
}

rootElement.innerHTML = App();
