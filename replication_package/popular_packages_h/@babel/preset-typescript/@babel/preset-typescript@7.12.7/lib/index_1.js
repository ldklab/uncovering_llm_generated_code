"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const transformTypescriptPlugin = require("@babel/plugin-transform-typescript").default;
const { OptionValidator } = require("@babel/helper-validator-option");

const optionValidator = new OptionValidator("@babel/preset-typescript");

const presetTypescript = declare((api, options) => {
  api.assertVersion(7);

  const {
    allowDeclareFields,
    allowNamespaces,
    jsxPragma,
    onlyRemoveTypeImports
  } = options;

  const jsxPragmaFrag = optionValidator.validateStringOption(
    "jsxPragmaFrag", 
    options.jsxPragmaFrag, 
    "React.Fragment"
  );

  const allExtensions = optionValidator.validateBooleanOption(
    "allExtensions", 
    options.allExtensions, 
    false
  );

  const isTSX = optionValidator.validateBooleanOption(
    "isTSX", 
    options.isTSX, 
    false
  );

  if (isTSX) {
    optionValidator.invariant(allExtensions, "isTSX:true requires allExtensions:true");
  }

  const createPluginOptions = (isTSX) => ({
    allowDeclareFields,
    allowNamespaces,
    isTSX,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports
  });

  return {
    overrides: allExtensions ? [{
      plugins: [[transformTypescriptPlugin, createPluginOptions(isTSX)]]
    }] : [{
      test: /\.ts$/,
      plugins: [[transformTypescriptPlugin, createPluginOptions(false)]]
    }, {
      test: /\.tsx$/,
      plugins: [[transformTypescriptPlugin, createPluginOptions(true)]]
    }]
  };
});

exports.default = presetTypescript;
