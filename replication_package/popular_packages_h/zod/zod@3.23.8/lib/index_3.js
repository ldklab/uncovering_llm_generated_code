"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Importing all exports from './external' using ES Module syntax.
const z = require("./external");
exports.z = z;

// Re-exporting all named exports from './external'.
Object.keys(z).forEach((key) => {
    if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
        exports[key] = z[key];
    }
});

// Setting default export to be the 'z' object which contains all exports from './external'.
exports.default = z;
