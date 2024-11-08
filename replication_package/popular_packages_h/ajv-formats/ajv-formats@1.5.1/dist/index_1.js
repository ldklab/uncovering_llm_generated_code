"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { fullFormats, fastFormats, formatNames } = require("./formats");
const applyLimit = require("./limit");
const { Name, _ } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

function formatsPlugin(ajv, opts = { keywords: true }) {
    if (Array.isArray(opts)) {
        attachFormats(ajv, opts, fullFormats, fullName);
        return ajv;
    }
    const [selectedFormats, exportName] = (opts.mode === "fast")
        ? [fastFormats, fastName] : [fullFormats, fullName];
    const formatList = opts.formats || formatNames;
    attachFormats(ajv, formatList, selectedFormats, exportName);
    if (opts.keywords) applyLimit(ajv);
    return ajv;
}

formatsPlugin.get = function(name, mode = "full") {
    const availableFormats = (mode === "fast") ? fastFormats : fullFormats;
    const format = availableFormats[name];
    if (!format) throw new Error(`Unknown format "${name}"`);
    return format;
};

function attachFormats(ajv, list, formats, exportName) {
    ajv.opts.code.formats = ajv.opts.code.formats || _(`require("ajv-formats/dist/formats").${exportName}`);
    for (const format of list) ajv.addFormat(format, formats[format]);
}

exports.default = formatsPlugin;
module.exports = formatsPlugin;
module.exports.default = formatsPlugin;
