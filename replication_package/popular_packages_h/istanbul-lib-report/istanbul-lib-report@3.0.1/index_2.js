'use strict';

// Import necessary modules and classes
const Context = require('./lib/context');
const watermarks = require('./lib/watermarks');
const ReportBase = require('./lib/report-base');

/**
 * This module exports functions and classes for creating reporting contexts, 
 * retrieving default watermarks, and a base class for reports.
 */
module.exports = {
    /**
     * Creates a new reporting context with the specified options.
     * @param {Object} [opts=null] - Options for context creation.
     * @returns {Context} - A new Context instance.
     */
    createContext(opts) {
        return new Context(opts);
    },

    /**
     * Retrieves the default watermarks for reporting, 
     * providing threshold percentages for various metrics.
     * @returns {Object} - An object containing watermark thresholds for 
     * statements, functions, branches, and lines.
     */
    getDefaultWatermarks() {
        return watermarks.getDefault();
    },

    /**
     * Base class for all types of reporting.
     */
    ReportBase
};
