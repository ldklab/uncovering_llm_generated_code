'use strict';

const path = require('path');

module.exports = {
    create(moduleName, config = {}) {
        let Constructor;
        try {
            // Attempt to load from local 'lib' directory
            Constructor = require(path.join(__dirname, 'lib', moduleName));
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND') {
                throw error; // Propagate other errors
            }
            // Attempt to load as a regular Node.js module
            Constructor = require(moduleName);
        }
        // Instantiate and return the module with provided configuration
        return new Constructor(config);
    }
};
