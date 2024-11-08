'use strict';

const Context = require('./lib/context');
const watermarks = require('./lib/watermarks');
const ReportBase = require('./lib/report-base');

module.exports = {
    createContext: (opts) => new Context(opts),
    getDefaultWatermarks: () => watermarks.getDefault(),
    ReportBase
};
