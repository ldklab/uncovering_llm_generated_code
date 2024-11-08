'use strict';

// Import the MapStore class from the map-store module
const { MapStore } = require('./lib/map-store');

// Export an object containing a factory function to create a MapStore instance
module.exports = {
    /**
     * Factory method to create a new MapStore instance
     * @param {Object} opts - Configuration options for the MapStore instance
     * @returns {MapStore} The newly created MapStore instance
     */
    createSourceMapStore(opts) {
        return new MapStore(opts);
    }
};
