'use strict';
/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const path = require('path');

module.exports = {
    create(name, cfg = {}) { // Use default parameter for cfg
        let Constructor;
        try {
            // Try to require a module from the local 'lib' directory
            Constructor = require(path.join(__dirname, 'lib', name));
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND') {
                // Re-throw the error if it wasn't a MODULE_NOT_FOUND error
                throw error;
            }
            // Fallback to requiring a module with the provided name
            Constructor = require(name);
        }

        // Return a new instance of the required module, passing config
        return new Constructor(cfg);
    }
};
