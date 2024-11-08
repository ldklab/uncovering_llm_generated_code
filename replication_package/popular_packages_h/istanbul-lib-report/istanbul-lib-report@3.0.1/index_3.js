"use strict";

const Context = require("./lib/context");
const watermarks = require("./lib/watermarks");
const ReportBase = require("./lib/report-base");

module.exports = {
    createContext(options = null) {
        return new Context(options);
    },

    getDefaultWatermarks() {
        return watermarks.getDefault();
    },

    ReportBase
};
