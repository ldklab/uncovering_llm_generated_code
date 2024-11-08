// file: index.js

// Define rule sets for ESLint configurations
const recommendedRules = {
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "curly": "error", 
    // Other rules can be added here
};

const allRules = {
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "curly": "error",
    "semi": "error",
    "no-console": "warn",
    // Additional rules can be added here
};

// ESLint plugin configuration
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

// Export the ESLint plugin
module.exports = jsPlugin;
