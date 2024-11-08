"use strict";

// Compatibility function for handling default imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

// Import the Graphemer module
const Graphemer = __importDefault(require("./Graphemer")).default;

// Export the Graphemer module as default
module.exports = Graphemer;
