'use strict';

const { declarePreset, declare } = require('@babel/helper-plugin-utils');
const transformTypeScriptPlugin = require('@babel/plugin-transform-typescript');
const transformModulesCommonJSPlugin = require('@babel/plugin-transform-modules-commonjs');
const OptionValidator = require('@babel/helper-validator-option');

const transformTypeScript = transformTypeScriptPlugin.default || { default: transformTypeScriptPlugin };
const transformModulesCommonJS = transformModulesCommonJSPlugin.default || { default: transformModulesCommonJSPlugin };

const optionValidator = new OptionValidator("@babel/preset-typescript");

// Function to normalize and validate options
function normalizeOptions(options = {}) {
  const {
    allowNamespaces = true,
    jsxPragma,
    onlyRemoveTypeImports,
    allExtensions = false,
    ignoreExtensions = false,
    disallowAmbiguousJSXLike = false,
    optimizeConstEnums = false,
    rewriteImportExtensions = false,
    isTSX = false
  } = options;

  const jsxPragmaFrag = optionValidator.validateStringOption(
    'jsxPragmaFrag', options.jsxPragmaFrag, 'React.Fragment'
  );

  if (isTSX) {
    optionValidator.invariant(allExtensions, "isTSX:true requires allExtensions:true");
  }

  if (disallowAmbiguousJSXLike) {
    optionValidator.invariant(allExtensions, "disallowAmbiguousJSXLike:true requires allExtensions:true");
  }

  return {
    ignoreExtensions,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
    rewriteImportExtensions,
    allExtensions,
    isTSX
  };
}

// Plugin to rewrite TypeScript import paths
const pluginRewriteTSImports = declare(({ types: t }) => ({
  name: "preset-typescript/plugin-rewrite-ts-imports",
  visitor: {
    "ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration"(path) {
      const { source } = path.node;
      const kind = t.isImportDeclaration(path.node) ? path.node.importKind : path.node.exportKind;

      if (kind === "value" && source && /[\\/]/.test(source.value)) {
        source.value = source.value.replace(/(\.[mc]?)ts$/, "$1js").replace(/\.tsx$/, ".js");
      }
    }
  }
}));

// Main preset function
const index = declarePreset((api, opts) => {
  api.assertVersion(7);

  const {
    allExtensions,
    ignoreExtensions,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    isTSX,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
    rewriteImportExtensions
  } = normalizeOptions(opts);

  const pluginOptions = {
    allowDeclareFields: opts.allowDeclareFields,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums
  };

  function getPlugins(isTSX, disallowAmbiguousJSXLike) {
    return [[transformTypeScript.default, { isTSX, ...pluginOptions }]];
  }

  const disableExtensionDetect = allExtensions || ignoreExtensions;

  return {
    plugins: rewriteImportExtensions ? [pluginRewriteTSImports] : [],
    overrides: disableExtensionDetect ? [
      {
        plugins: getPlugins(isTSX, disallowAmbiguousJSXLike)
      }
    ] : [
      {
        test: /\.ts$/,
        plugins: getPlugins(false, false)
      },
      {
        test: /\.mts$/,
        sourceType: "module",
        plugins: getPlugins(false, true)
      },
      {
        test: /\.cts$/,
        sourceType: "unambiguous",
        plugins: [
          [transformModulesCommonJS.default, { allowTopLevelThis: true }],
          [transformTypeScript.default, { ...pluginOptions, disallowAmbiguousJSXLike: true }]
        ]
      },
      {
        test: /\.tsx$/,
        plugins: getPlugins(true, false)
      }
    ]
  };
});

module.exports = {
  default: index
};