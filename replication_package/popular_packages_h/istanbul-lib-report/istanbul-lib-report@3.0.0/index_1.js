'use strict';

/**
 * Module to manage report context and defaults.
 */

const Context = require('./lib/context');
const watermarks = require('./lib/watermarks');
const ReportBase = require('./lib/report-base');

module.exports = {
    
    /**
     * Create and return a reporting context with optional settings.
     * @param {Object} [opts=null] - Optional settings for context creation.
     * @returns {Context} - A new Context object.
     */
    createContext(opts = null) {
        return new Context(opts);
    },

    /**
     * Retrieve the default coverage watermarks.
     * @returns {Object} - An object containing default watermarks for `statements`, 
     * `functions`, `branches`, and `line`, where each value is an array of two 
     * percentages (low and high).
     */
    getDefaultWatermarks() {
        return watermarks.getDefault();
    },

    /**
     * Export the base class for creating reports.
     */
    ReportBase,
};
