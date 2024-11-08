// file: index.js

// Define a set of recommended ESLint rules
const recommendedRules = {
    "no-unused-vars": "error", // Disallow unused variables
    "eqeqeq": "error",         // Require the use of === and !==
    "curly": "error",          // Enforce consistent brace style for blocks
    // Additional recommended rules...
};

// Define a comprehensive set of all available ESLint rules
const allRules = {
    "no-unused-vars": "error", // Disallow unused variables
    "eqeqeq": "error",         // Require the use of === and !==
    "curly": "error",          // Enforce consistent brace style for blocks
    "semi": "error",           // Require semicolons
    "no-console": "warn",      // Warn on console usage
    // More ESLint rules...
};

// Create a plugin object containing both configurations
const jsPlugin = {
    configs: {
        recommended: {
            rules: recommendedRules
        },
        all: {
            rules: allRules
        }
    }
};

// Export the plugin for use in other modules
module.exports = jsPlugin;
