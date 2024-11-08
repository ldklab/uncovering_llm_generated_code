"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const transformTypescript = require("@babel/plugin-transform-typescript").default;
const { OptionValidator } = require("@babel/helper-validator-option");

const validator = new OptionValidator("@babel/preset-typescript");

const presetTypescript = declare((api, options) => {
  api.assertVersion(7);

  const { 
    allowDeclareFields, 
    allowNamespaces, 
    jsxPragma, 
    onlyRemoveTypeImports,
    jsxPragmaFrag, 
    allExtensions, 
    isTSX 
  } = options;

  const validatedJsxPragmaFrag = validator.validateStringOption("jsxPragmaFrag", jsxPragmaFrag, "React.Fragment");
  const validatedAllExtensions = validator.validateBooleanOption("allExtensions", allExtensions, false);
  const validatedIsTSX = validator.validateBooleanOption("isTSX", isTSX, false);

  if (validatedIsTSX) {
    validator.invariant(validatedAllExtensions, "isTSX:true requires allExtensions:true");
  }

  const createPluginOptions = isTSX => ({
    allowDeclareFields,
    allowNamespaces,
    isTSX,
    jsxPragma,
    jsxPragmaFrag: validatedJsxPragmaFrag,
    onlyRemoveTypeImports
  });

  return {
    overrides: validatedAllExtensions ? [{
      plugins: [[transformTypescript, createPluginOptions(validatedIsTSX)]]
    }] : [{
      test: /\.ts$/,
      plugins: [[transformTypescript, createPluginOptions(false)]]
    }, {
      test: /\.tsx$/,
      plugins: [[transformTypescript, createPluginOptions(true)]]
    }]
  };
});

exports.default = presetTypescript;
