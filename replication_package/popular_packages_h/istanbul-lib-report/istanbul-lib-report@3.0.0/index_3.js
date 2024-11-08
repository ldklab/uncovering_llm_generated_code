'use strict';

/**
 * @module Exports
 */

const Context = require('./lib/context');
const watermarks = require('./lib/watermarks');
const ReportBase = require('./lib/report-base');

const createContext = (opts = null) => new Context(opts);

const getDefaultWatermarks = () => watermarks.getDefault();

module.exports = {
    createContext,
    getDefaultWatermarks,
    ReportBase
};
