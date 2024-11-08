'use strict';

// Import necessary modules
const Context = require('./lib/context');
const watermarks = require('./lib/watermarks');
const ReportBase = require('./lib/report-base');

/**
 * Module exports providing functionalities to create a reporting context,
 * obtain default watermarks, and utilize a base class for reports.
 */
module.exports = {
    /**
     * Creates and returns a reporting context with the given options.
     * @param {Object} [opts=null] - Options for context creation.
     * @returns {Context} New reporting context.
     */
    createContext: function(opts) {
        return new Context(opts);
    },

    /**
     * Retrieves the standard default watermarks used if not specifically set.
     * @returns {Object} Watermark defaults: {statements, functions, branches, line}.
     */
    getDefaultWatermarks: function() {
        return watermarks.getDefault();
    },

    /**
     * ReportBase class as a foundation for report construction.
     */
    ReportBase: ReportBase
};
