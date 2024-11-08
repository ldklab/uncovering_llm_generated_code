"use strict";

const { fullFormats, fastFormats, formatNames } = require("./formats");
const applyLimit = require("./limit");
const { Name, _ } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

function formatsPlugin(ajv, options = { keywords: true }) {
  if (Array.isArray(options)) {
    addFormats(ajv, options, fullFormats, fullName);
    return ajv;
  }

  const [selectedFormats, exportName] = options.mode === "fast" 
    ? [fastFormats, fastName] 
    : [fullFormats, fullName];

  const formatList = options.formats || formatNames;
  addFormats(ajv, formatList, selectedFormats, exportName);

  if (options.keywords) {
    applyLimit(ajv);
  }

  return ajv;
}

formatsPlugin.get = function (name, mode = "full") {
  const selectedFormats = mode === "fast" ? fastFormats : fullFormats;
  const format = selectedFormats[name];

  if (!format) {
    throw new Error(`Unknown format "${name}"`);
  }

  return format;
};

function addFormats(ajv, list, formats, exportName) {
  ajv.opts.code.formats = ajv.opts.code.formats 
    || _('require("ajv-formats/dist/formats").' + exportName);

  for (const format of list) {
    ajv.addFormat(format, formats[format]);
  }
}

module.exports = formatsPlugin;
exports.default = formatsPlugin;
