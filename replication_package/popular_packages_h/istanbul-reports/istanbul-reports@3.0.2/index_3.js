'use strict';

/*
  Copyright 2012-2015, Yahoo Inc.
  Licensed under the New BSD License. Please refer to the accompanying LICENSE file for more details.
*/

const path = require('path');

module.exports = {
    create(moduleName, config = {}) {
        let Constructor;

        try {
            // Attempt to require a module from the 'lib' directory within the current directory
            Constructor = require(path.join(__dirname, 'lib', moduleName));
        } catch (error) {
            // If the error isn't due to the module not being found, rethrow the error
            if (error.code !== 'MODULE_NOT_FOUND') {
                throw error;
            }

            // If the module isn't found in the 'lib' directory, attempt to require it as a module normally
            Constructor = require(moduleName);
        }

        // Return a new instance of the required module's constructor, passing the provided configuration object
        return new Constructor(config);
    }
};
