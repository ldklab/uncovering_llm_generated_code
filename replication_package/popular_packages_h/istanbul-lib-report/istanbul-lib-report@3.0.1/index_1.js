'use strict';

// Import necessary modules
const Context = require('./lib/context');
const watermarks = require('./lib/watermarks');
const ReportBase = require('./lib/report-base');

// Exported functionalities
module.exports = {

    // Create and return a new Context with optional configuration
    createContext(options = null) {
        return new Context(options);
    },

    // Retrieve the default watermarks for coverage metrics
    getDefaultWatermarks() {
        return watermarks.getDefault();
    },

    // Base class for report generation
    ReportBase
};
