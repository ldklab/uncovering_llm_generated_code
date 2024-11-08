'use strict';

// Required modules for the reporting functionality
const Context = require('./lib/context');
const watermarks = require('./lib/watermarks');
const ReportBase = require('./lib/report-base');

// Exporting module that provides context creation, watermark defaults, and report base class
module.exports = {
    /**
     * Creates a reporting context with provided options.
     * @param {Object} [opts=null] - Options for context creation.
     * @returns {Context} A new Context object.
     */
    createContext(opts) {
        return new Context(opts);
    },

    /**
     * Retrieves the default coverage watermarks.
     * @returns {Object} An object containing percentage watermarks for
     * 'statements', 'functions', 'branches', and 'line'.
     */
    getDefaultWatermarks() {
        return watermarks.getDefault();
    },

    // Base class for creating custom reports
    ReportBase
};
