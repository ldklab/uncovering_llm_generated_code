'use strict';
/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const path = require('path');

module.exports = {
    create(instanceName, config = {}) {
        let Constructor;
        try {
            // Try requiring a module located in the ./lib directory
            Constructor = require(path.join(__dirname, 'lib', instanceName));
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND') {
                // If the error is not because the module wasn't found, rethrow it
                throw error;
            }

            // If the module wasn't found in ./lib, try requiring it as a regular module
            Constructor = require(instanceName);
        }

        // Return a new instance of the found constructor with the configuration provided
        return new Constructor(config);
    }
};
