"use strict";

const { fullFormats, fastFormats, formatNames } = require("./formats");
const limitPlugin = require("./limit");
const { Name } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

function formatsPlugin(ajv, opts = { keywords: true }) {
    if (Array.isArray(opts)) {
        applyFormats(ajv, opts, fullFormats, fullName);
        return ajv;
    }

    const [selectedFormats, exportFormatName] = opts.mode === "fast" 
        ? [fastFormats, fastName] 
        : [fullFormats, fullName];

    const formatList = opts.formats || formatNames;
    applyFormats(ajv, formatList, selectedFormats, exportFormatName);

    if (opts.keywords) {
        limitPlugin(ajv);
    }
    
    return ajv;
}

formatsPlugin.get = function (name, mode = "full") {
    const formats = mode === "fast" ? fastFormats : fullFormats;
    const format = formats[name];
    
    if (!format) {
        throw new Error(`Unknown format "${name}"`);
    }
    
    return format;
}

function applyFormats(ajv, formatList, formatsCollection, exportFormatName) {
    ajv.opts.code.formats ||= `require("ajv-formats/dist/formats").${exportFormatName}`;
    
    for (const format of formatList) {
        ajv.addFormat(format, formatsCollection[format]);
    }
}

exports.default = formatsPlugin;
module.exports = formatsPlugin;
module.exports.default = formatsPlugin;
//# sourceMappingURL=index.js.map
