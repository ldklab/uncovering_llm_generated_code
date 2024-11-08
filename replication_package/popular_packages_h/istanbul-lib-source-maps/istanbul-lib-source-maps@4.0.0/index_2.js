'use strict';

const { MapStore } = require('./lib/map-store');

module.exports = {
    createSourceMapStore(options) {
        return new MapStore(options);
    }
};
