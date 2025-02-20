'use strict';
const path = require('path');

module.exports = {
    create(moduleName, config = {}) {
        let Constructor;
        try {
            Constructor = require(path.join(__dirname, 'lib', moduleName));
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND') {
                throw error;
            }

            Constructor = require(moduleName);
        }

        return new Constructor(config);
    }
};
