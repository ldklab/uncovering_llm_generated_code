// file: index.js

// Defining mock rule sets for ESLint configuration
const recommendedRules = {
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "curly": "error",
    // Additional recommended rule entries can be included here...
};

const allRules = {
    ...recommendedRules,  // Spread operator to include all recommended rules
    "semi": "error",
    "no-console": "warn",
    // Additional rule entries for comprehensive checks...
};

// Creating an ESLint plugin configuration object
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

// Exporting the plugin for use in ESLint configurations
module.exports = jsPlugin;
