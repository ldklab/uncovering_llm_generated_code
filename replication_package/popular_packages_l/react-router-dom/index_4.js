// index.js
const express = require('express');
const routerDom = require('./router-dom');

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <div id="root"></div>
    <script src="bundle.js"></script>
  `);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// router-dom.js
module.exports = {
  BrowserRouter: function (props) {
    return `<div>${props.children}</div>`;
  },
  Route: function ({ path, component: Component }) {
    if (window.location.pathname === path) {
      return `<div>${Component()}</div>`;
    }
    return null;
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
(function () {
  const rootElement = document.getElementById('root');

  function Home() {
    return 'Home Page';
  }

  function About() {
    return 'About Page';
  }

  function App() {
    return `
      ${routerDom.BrowserRouter({
        children: `
          ${routerDom.Link({ to: '/', children: 'Home' })}
          ${routerDom.Link({ to: '/about', children: 'About' })}
          ${routerDom.Switch({
            children: [
              routerDom.Route({ path: '/', component: Home }),
              routerDom.Route({ path: '/about', component: About }),
            ],
          })}
      `,
      })}
    `;
  }

  rootElement.innerHTML = App();
})();
