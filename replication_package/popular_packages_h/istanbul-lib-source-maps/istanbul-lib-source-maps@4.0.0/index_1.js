// Imports the MapStore class from the map-store module
const { MapStore } = require('./lib/map-store');

// Exports an object with a function to create a MapStore instance
module.exports = {
    // Factory function to create and return a MapStore instance
    createSourceMapStore(options) {
        // Instantiates a new MapStore with the provided options
        return new MapStore(options);
    }
};
