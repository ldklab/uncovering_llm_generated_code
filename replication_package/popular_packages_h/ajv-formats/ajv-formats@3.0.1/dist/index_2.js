"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { fullFormats, fastFormats, formatNames } = require("./formats");
const applyLimit = require("./limit").default;
const { Name, _ } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

const formatsPlugin = (ajv, opts = { keywords: true }) => {
    if (Array.isArray(opts)) {
        addFormats(ajv, opts, fullFormats, fullName);
        return ajv;
    }

    const [selectedFormats, exportName] = opts.mode === "fast" ? [fastFormats, fastName] : [fullFormats, fullName];
    const list = opts.formats || formatNames;
    addFormats(ajv, list, selectedFormats, exportName);

    if (opts.keywords) applyLimit(ajv);
    return ajv;
};

formatsPlugin.get = (name, mode = "full") => {
    const selectedFormats = mode === "fast" ? fastFormats : fullFormats;
    const format = selectedFormats[name];

    if (!format) {
        throw new Error(`Unknown format "${name}"`);
    }
    return format;
};

function addFormats(ajv, list, formats, exportName) {
    var _a, _b;
    (_a = (_b = ajv.opts.code).formats) === null || _a === void 0 ? _a : (_b.formats = _`require("ajv-formats/dist/formats").${exportName}`);

    for (const format of list) {
        ajv.addFormat(format, formats[format]);
    }
}

module.exports = exports = formatsPlugin;
exports.default = formatsPlugin;
