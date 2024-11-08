"use strict";

// Export an object containing ESLint configuration settings
module.exports = {
    // The configs property holds different ESLint configuration sets
    configs: {
        // 'all' configuration set, imported from the eslint-all file
        all: require("./configs/eslint-all"),
        
        // 'recommended' configuration set, imported from the eslint-recommended file
        recommended: require("./configs/eslint-recommended")
    }
};
