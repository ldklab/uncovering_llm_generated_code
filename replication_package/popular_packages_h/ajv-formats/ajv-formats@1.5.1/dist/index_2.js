"use strict";
const { fullFormats, fastFormats, formatNames } = require("./formats");
const addLimitKeywords = require("./limit");
const { Name, _ } = require("ajv/dist/compile/codegen");

const fullName = new Name("fullFormats");
const fastName = new Name("fastFormats");

const formatsPlugin = (ajv, opts = { keywords: true }) => {
  if (Array.isArray(opts)) {
    addFormats(ajv, opts, fullFormats, fullName);
    return ajv;
  }
  
  const [formatsSet, exportName] = opts.mode === "fast" ? [fastFormats, fastName] : [fullFormats, fullName];
  const formatsList = opts.formats || formatNames;
  
  addFormats(ajv, formatsList, formatsSet, exportName);
  
  if (opts.keywords) {
    addLimitKeywords(ajv);
  }
  
  return ajv;
};

formatsPlugin.get = (name, mode = "full") => {
  const formatsSet = mode === "fast" ? fastFormats : fullFormats;
  const format = formatsSet[name];
  
  if (!format) {
    throw new Error(`Unknown format "${name}"`);
  }
  
  return format;
};

function addFormats(ajv, list, formatsSet, exportName) {
  ajv.opts.code.formats = ajv.opts.code.formats || _ `require("ajv-formats/dist/formats").${exportName}`;
  
  for (const formatName of list) {
    ajv.addFormat(formatName, formatsSet[formatName]);
  }
}

exports.default = formatsPlugin;
module.exports = formatsPlugin;
module.exports.default = formatsPlugin;
