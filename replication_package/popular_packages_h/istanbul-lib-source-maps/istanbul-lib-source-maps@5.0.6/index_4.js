'use strict';

const { MapStore } = require('./lib/map-store');

/**
 * Provides functionality to create a new MapStore.
 */
module.exports = {
    /**
     * Factory method to create a new MapStore instance.
     * 
     * @param {Object} [opts] - Optional configuration options for the MapStore.
     * @returns {MapStore} A new instance of MapStore.
     */
    createSourceMapStore(options) {
        return new MapStore(options);
    }
};
