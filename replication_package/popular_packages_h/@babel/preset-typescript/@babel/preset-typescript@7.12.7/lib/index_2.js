"use strict";

import { declare } from "@babel/helper-plugin-utils";
import transformTypescript from "@babel/plugin-transform-typescript";
import { OptionValidator } from "@babel/helper-validator-option";

const v = new OptionValidator("@babel/preset-typescript");

export default declare((api, opts) => {
  api.assertVersion(7);

  const {
    allowDeclareFields,
    allowNamespaces,
    jsxPragma,
    onlyRemoveTypeImports
  } = opts;

  const jsxPragmaFrag = v.validateStringOption("jsxPragmaFrag", opts.jsxPragmaFrag, "React.Fragment");
  const allExtensions = v.validateBooleanOption("allExtensions", opts.allExtensions, false);
  const isTSX = v.validateBooleanOption("isTSX", opts.isTSX, false);

  if (isTSX) {
    v.invariant(allExtensions, "isTSX:true requires allExtensions:true");
  }

  const pluginOptions = (isTSX) => ({
    allowDeclareFields,
    allowNamespaces,
    isTSX,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports
  });

  return {
    overrides: allExtensions
      ? [{ plugins: [[transformTypescript, pluginOptions(isTSX)]] }]
      : [
          {
            test: /\.ts$/,
            plugins: [[transformTypescript, pluginOptions(false)]]
          },
          {
            test: /\.tsx$/,
            plugins: [[transformTypescript, pluginOptions(true)]]
          }
        ]
  };
});
