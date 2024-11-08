// package.json
{
  "name": "react-router-simulated",
  "version": "1.0.0",
  "description": "A simulated core routing functionality for React applications.",
  "main": "index.js",
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0"
  },
  "dependencies": {},
  "scripts": {},
  "author": "Your Name",
  "license": "MIT"
}

// index.js
class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentPath = window.location.pathname;
  }

  init() {
    window.onpopstate = () => {
      this.currentPath = window.location.pathname;
      this.render();
    };
    this.render();
  }

  navigate(path) {
    window.history.pushState({}, path, window.location.origin + path);
    this.currentPath = path;
    this.render();
  }

  render() {
    const route = this.routes.find(route => route.path === this.currentPath);
    const view = route ? route.view : this.routes.find(route => route.path === '*').view;
    document.getElementById('app').innerHTML = view();
  }
}

// Simulated routes example
const routes = [
  {
    path: '/',
    view: () => '<h1>Home</h1>',
  },
  {
    path: '/about',
    view: () => '<h1>About</h1>',
  },
  {
    path: '*',
    view: () => '<h1>404 Not Found</h1>',
  },
];

// Initialize and start the router
const router = new Router(routes);
router.init();

// Example navigation function that can be used in a simulated app
function navigateTo(path) {
  router.navigate(path);
}

// Example of usage
document.getElementById('to-about').addEventListener('click', () => navigateTo('/about'));
document.getElementById('to-home').addEventListener('click', () => navigateTo('/'));
