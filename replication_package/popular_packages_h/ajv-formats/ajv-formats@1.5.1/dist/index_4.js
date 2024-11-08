"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { fullFormats, fastFormats, formatNames } = require("./formats");
const limit = require("./limit");
const { Name, _ } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

const formatsPlugin = (ajv, opts = { keywords: true }) => {
    if (Array.isArray(opts)) {
        configureFormats(ajv, opts, fullFormats, fullName);
        return ajv;
    }
    const [formatSet, exportName] = opts.mode === "fast" ? [fastFormats, fastName] : [fullFormats, fullName];
    const selectedFormats = opts.formats || formatNames;
    configureFormats(ajv, selectedFormats, formatSet, exportName);
    if (opts.keywords) limit(ajv);

    return ajv;
};

formatsPlugin.get = (name, mode = "full") => {
    const formatSet = mode === "fast" ? fastFormats : fullFormats;
    const format = formatSet[name];
    if (!format) throw new Error(`Unknown format "${name}"`);
    return format;
};

function configureFormats(ajv, formatList, formats, exportName) {
    let codeFormats = ajv.opts.code.formats;
    codeFormats = codeFormats !== undefined ? codeFormats : (ajv.opts.code.formats = _`require("ajv-formats/dist/formats").${exportName}`);
    for (const format of formatList) {
        ajv.addFormat(format, formats[format]);
    }
}

exports.default = formatsPlugin;

module.exports = formatsPlugin;
module.exports.default = formatsPlugin;
