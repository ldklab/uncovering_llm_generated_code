// file: index.js

// Mock ESLint configuration objects to mimic rule configurations
const recommendedRules = {
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "curly": "error",
    // Other recommended rules...
};

const allRules = {
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "curly": "error",
    "semi": "error",
    "no-console": "warn",
    // All other ESLint rules...
};

// Plugin exports
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

// Export the plugin
module.exports = jsPlugin;
