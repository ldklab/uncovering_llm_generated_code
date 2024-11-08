'use strict';

// Importing the MapStore class from the lib/map-store module.
const { MapStore } = require('./lib/map-store');

/**
 * Module that exports a function to create a Source Map Store.
 */
module.exports = {
    /**
     * Create a new Source Map Store instance.
     *
     * @param {Object} [opts] - Optional configuration object.
     * @returns {MapStore} A new MapStore instance.
     */
    createSourceMapStore(opts) {
        // Create and return a new MapStore instance with the given options.
        return new MapStore(opts);
    }
};
