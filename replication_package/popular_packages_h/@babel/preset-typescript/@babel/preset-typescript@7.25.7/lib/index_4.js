'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const { declare, declarePreset } = require('@babel/helper-plugin-utils');
const typeScriptTransform = require('@babel/plugin-transform-typescript');
const jsxSyntax = require('@babel/plugin-syntax-jsx');
const commonJSTransform = require('@babel/plugin-transform-modules-commonjs');
const { OptionValidator } = require('@babel/helper-validator-option');

const typeScriptTransformDefault = typeScriptTransform.default || typeScriptTransform;
const commonJSTransformDefault = commonJSTransform.default || commonJSTransform;

const validator = new OptionValidator("@babel/preset-typescript");

function normalizeOptions(inputOptions = {}) {
  const defaults = {
    allowNamespaces: true,
    jsxPragma: undefined,
    onlyRemoveTypeImports: false
  };

  const {
    allowNamespaces,
    jsxPragma,
    onlyRemoveTypeImports
  } = { ...defaults, ...inputOptions };

  const allExtensions = validator.validateBooleanOption("allExtensions", inputOptions.allExtensions, false);
  const isTSX = validator.validateBooleanOption("isTSX", inputOptions.isTSX, false);

  if(isTSX) {
    validator.invariant(allExtensions, "isTSX:true requires allExtensions:true");
  }

  const ignoreExtensions = validator.validateBooleanOption("ignoreExtensions", inputOptions.ignoreExtensions, false);
  const disallowAmbiguousJSXLike = validator.validateBooleanOption("disallowAmbiguousJSXLike", inputOptions.disallowAmbiguousJSXLike, false);
  if (disallowAmbiguousJSXLike) {
    validator.invariant(allExtensions, "disallowAmbiguousJSXLike:true requires allExtensions:true");
  }
  
  const optimizeConstEnums = validator.validateBooleanOption("optimizeConstEnums", inputOptions.optimizeConstEnums, false);
  const rewriteImportExtensions = validator.validateBooleanOption("rewriteImportExtensions", inputOptions.rewriteImportExtensions, false);
  const jsxPragmaFrag = validator.validateStringOption("jsxPragmaFrag", inputOptions.jsxPragmaFrag, "React.Fragment");

  return {
    ignoreExtensions,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
    allExtensions,
    isTSX,
    rewriteImportExtensions
  };
}

const pluginRewriteTSImports = declare(function({ types: t }) {
  return {
    name: "preset-typescript/plugin-rewrite-ts-imports",
    visitor: {
      "ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration"({ node }) {
        const { source } = node;
        const kind = t.isImportDeclaration(node) ? node.importKind : node.exportKind;
        if (kind === "value" && source && /[\\/]/.test(source.value)) {
          source.value = source.value.replace(/(\.[mc]?)ts$/, "$1js").replace(/\.tsx$/, ".js");
        }
      }
    }
  };
});

const preset = declarePreset((api, opts) => {
  api.assertVersion(7);

  const options = normalizeOptions(opts);

  const pluginOptions = (disallowAmbiguousJSXLike) => ({
    allowDeclareFields: opts.allowDeclareFields,
    allowNamespaces: options.allowNamespaces,
    disallowAmbiguousJSXLike,
    jsxPragma: options.jsxPragma,
    jsxPragmaFrag: options.jsxPragmaFrag,
    onlyRemoveTypeImports: options.onlyRemoveTypeImports,
    optimizeConstEnums: options.optimizeConstEnums
  });

  const getPlugins = (isTSX, disallowAmbiguousJSXLike) => [
    [typeScriptTransformDefault, { isTSX, ...pluginOptions(disallowAmbiguousJSXLike) }]
  ];

  const disableExtensionDetect = options.allExtensions || options.ignoreExtensions;

  return {
    plugins: options.rewriteImportExtensions ? [pluginRewriteTSImports] : [],
    overrides: disableExtensionDetect ? [{
      plugins: getPlugins(options.isTSX, options.disallowAmbiguousJSXLike)
    }] : [{
      test: /\.ts$/,
      plugins: getPlugins(false, false)
    }, {
      test: /\.mts$/,
      sourceType: "module",
      plugins: getPlugins(false, true)
    }, {
      test: /\.cts$/,
      sourceType: "unambiguous",
      plugins: [
        [commonJSTransformDefault, { allowTopLevelThis: true }],
        [typeScriptTransformDefault, pluginOptions(true)]
      ]
    }, {
      test: /\.tsx$/,
      plugins: getPlugins(true, false)
    }]
  };
});

exports.default = preset;
