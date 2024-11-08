"use strict";

import { declare } from "@babel/helper-plugin-utils";
import transformTypeScript from "@babel/plugin-transform-typescript";
import { OptionValidator } from "@babel/helper-validator-option";

const validator = new OptionValidator("@babel/preset-typescript");

export default declare((api, opts) => {
  api.assertVersion(7);

  const {
    allowDeclareFields,
    allowNamespaces,
    jsxPragma,
    onlyRemoveTypeImports
  } = opts;

  const jsxPragmaFrag = validator.validateStringOption("jsxPragmaFrag", opts.jsxPragmaFrag, "React.Fragment");
  const allExtensions = validator.validateBooleanOption("allExtensions", opts.allExtensions, false);
  const isTSX = validator.validateBooleanOption("isTSX", opts.isTSX, false);

  if (isTSX) {
    validator.invariant(allExtensions, "isTSX:true requires allExtensions:true");
  }

  const createPluginOptions = isTSX => ({
    allowDeclareFields,
    allowNamespaces,
    isTSX,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports
  });

  return {
    overrides: allExtensions ? [{
      plugins: [[transformTypeScript, createPluginOptions(isTSX)]]
    }] : [{
      test: /\.ts$/,
      plugins: [[transformTypeScript, createPluginOptions(false)]]
    }, {
      test: /\.tsx$/,
      plugins: [[transformTypeScript, createPluginOptions(true)]]
    }]
  };
});
