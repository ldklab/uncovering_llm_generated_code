// file: index.js

// Mock ESLint rule configurations for demonstration purposes
const rules = {
    recommended: {
        "no-unused-vars": "error",
        "eqeqeq": "error",
        "curly": "error",
    },
    all: {
        "no-unused-vars": "error",
        "eqeqeq": "error",
        "curly": "error",
        "semi": "error",
        "no-console": "warn",
    }
};

// Export the ESLint rules as a plugin with specific configurations
module.exports = {
    configs: {
        recommended: {
            rules: rules.recommended
        },
        all: {
            rules: rules.all
        }
    }
};
