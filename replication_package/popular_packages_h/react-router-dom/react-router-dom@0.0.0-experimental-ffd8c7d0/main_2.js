'use strict';

let reactRouterDom;

if (process.env.NODE_ENV === "production") {
  reactRouterDom = require("./umd/react-router-dom.production.min.js");
} else {
  reactRouterDom = require("./umd/react-router-dom.development.js");
}

module.exports = reactRouterDom;
