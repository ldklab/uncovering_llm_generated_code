"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { fullFormats, fastFormats, formatNames } = require("./formats");
const limit = require("./limit");
const { Name, _ } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

const formatsPlugin = (ajv, opts = { keywords: true }) => {
    if (Array.isArray(opts)) {
        addFormats(ajv, opts, fullFormats, fullName);
        return ajv;
    }
    
    const [formats, exportName] = opts.mode === "fast" 
        ? [fastFormats, fastName] 
        : [fullFormats, fullName];
    
    const list = opts.formats || formatNames;
    addFormats(ajv, list, formats, exportName);
    
    if (opts.keywords) {
        limit(ajv);
    }
    
    return ajv;
};

formatsPlugin.get = (name, mode = "full") => {
    const formats = mode === "fast" ? fastFormats : fullFormats;
    const format = formats[name];
    
    if (!format) {
        throw new Error(`Unknown format "${name}"`);
    }
    
    return format;
};

function addFormats(ajv, list, formatSet, exportName) {
    ajv.opts.code.formats = ajv.opts.code.formats || _`require("ajv-formats/dist/formats").${exportName}`;
    
    for (const format of list) {
        ajv.addFormat(format, formatSet[format]);
    }
}

module.exports = exports = formatsPlugin;
exports.default = formatsPlugin;
