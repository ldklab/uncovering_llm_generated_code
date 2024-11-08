"use strict";

// Import the webpack-cli module using require
const CLI = require("./webpack-cli");

// Set the __esModule property to true to indicate ES6 module compatibility
Object.defineProperty(exports, "__esModule", { value: true });

// Export the CLI module so that other files importing this file receive CLI
module.exports = CLI;
