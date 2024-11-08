"use strict";

const isProduction = process.env.NODE_ENV === "production";
const reactRouterDom = isProduction
  ? require("./umd/react-router-dom.production.min.js")
  : require("./umd/react-router-dom.development.js");

module.exports = reactRouterDom;
