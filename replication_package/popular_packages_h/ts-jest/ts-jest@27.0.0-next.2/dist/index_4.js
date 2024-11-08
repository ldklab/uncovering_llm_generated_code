"use strict";

// Import the TsJestTransformer from the local module './ts-jest-transformer'
const { TsJestTransformer } = require("./ts-jest-transformer");

// Define a function to create a new TsJestTransformer instance
function createTransformer() {
    return new TsJestTransformer();
}

// Export the createTransformer function for use in other modules
module.exports.createTransformer = createTransformer;
