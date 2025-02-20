'use strict';

/*
 This module provides a factory function to create an instance of a class or constructor function.
 It tries to require a module located in a 'lib' directory relative to the current directory.
 If the module with the given name is not found in the 'lib' directory, it attempts to require it
 from a globally or locally installed package or module. 

 By default, it exports an object with a 'create' method. The 'create' method takes two parameters:
 - `name`: the name of the module to be required
 - `cfg`: an optional configuration object that will be passed to the constructor when the module is instantiated. 

 The method attempts to create an instance of the required module with the provided configuration.
*/

const path = require('path');

module.exports = {
    create(moduleName, config = {}) {
        let Constructor;
        try {
            // Attempt to require the module from the 'lib' directory relative to this file
            Constructor = require(path.join(__dirname, 'lib', moduleName));
        } catch (err) {
            if (err.code !== 'MODULE_NOT_FOUND') {
                // If the error is not because the module wasn't found, rethrow the error
                throw err;
            }
            // If the module was not found in the 'lib' directory, attempt to require it as a regular module
            Constructor = require(moduleName);
        }

        // Return a new instance of the required module, initialized with the provided configuration
        return new Constructor(config);
    }
};
