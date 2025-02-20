'use strict';
// This module is responsible for dynamically creating instances of classes/modules based on a given name.
// It attempts to load a module either from a specific 'lib' directory or directly by its name if not found in 'lib'.
const path = require('path');

module.exports = {
    // The create function attempts to load a module constructor by its name and then instantiate it with a given configuration.
    create(name, cfg) {
        // If no configuration is provided, use an empty object.
        cfg = cfg || {};
        let Constructor;

        try {
            // First, attempt to load the module from the 'lib' directory within the current directory.
            Constructor = require(path.join(__dirname, 'lib', name));
        } catch (error) {
            // If the module is not found within the 'lib' directory, attempt to require it by name directly.
            if (error.code !== 'MODULE_NOT_FOUND') {
                // If any error other than 'MODULE_NOT_FOUND' occurs, rethrow the error.
                throw error;
            }

            // Require the module directly if it wasn't found in the 'lib' directory.
            Constructor = require(name);
        }

        // Create and return a new instance of the module's constructor with the provided configuration.
        return new Constructor(cfg);
    }
};
