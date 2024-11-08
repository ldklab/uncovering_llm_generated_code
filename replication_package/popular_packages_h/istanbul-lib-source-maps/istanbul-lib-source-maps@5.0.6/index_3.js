'use strict';

const { MapStore } = require('./lib/map-store');

module.exports = {
    /**
     * Factory function to create a MapStore instance
     * @param {Object} [opts] - Options to configure the MapStore
     * @returns {MapStore} A new MapStore instance
     */
    createSourceMapStore(opts) {
        return new MapStore(opts);
    }
};
