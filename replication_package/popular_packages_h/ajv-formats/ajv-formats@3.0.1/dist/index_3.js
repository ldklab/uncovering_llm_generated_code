"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { fullFormats, fastFormats, formatNames } = require("./formats");
const applyLimit = require("./limit");
const { Name, _ } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

function formatsPlugin(ajv, opts = { keywords: true }) {
    if (Array.isArray(opts)) {
        applyFormats(ajv, opts, fullFormats, fullName);
        return ajv;
    }

    const isFastMode = opts.mode === "fast";
    const [formatsSet, exportName] = isFastMode ? [fastFormats, fastName] : [fullFormats, fullName];
    const formatsList = opts.formats || formatNames;

    applyFormats(ajv, formatsList, formatsSet, exportName);

    if (opts.keywords) {
        applyLimit(ajv);
    }

    return ajv;
}

formatsPlugin.get = (name, mode = "full") => {
    const formatsSet = mode === "fast" ? fastFormats : fullFormats;
    const format = formatsSet[name];
    if (!format) {
        throw new Error(`Unknown format "${name}"`);
    }
    return format;
};

function applyFormats(ajv, formatsList, formatsSet, exportName) {
    ajv.opts.code.formats = ajv.opts.code.formats || _`require("ajv-formats/dist/formats").${exportName}`;
    for (const formatName of formatsList) {
        ajv.addFormat(formatName, formatsSet[formatName]);
    }
}

module.exports = exports = formatsPlugin;
exports.default = formatsPlugin;
