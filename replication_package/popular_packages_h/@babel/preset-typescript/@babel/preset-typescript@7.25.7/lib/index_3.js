'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const { declarePreset, declare } = require('@babel/helper-plugin-utils');
const transformTS = require('@babel/plugin-transform-typescript');
const transformCommonJS = require('@babel/plugin-transform-modules-commonjs');
const { OptionValidator } = require('@babel/helper-validator-option');

function _interopDefault(e) {
  return e && e.__esModule ? e : { default: e };
}

const transformTSDefault = _interopDefault(transformTS);
const transformCommonJSDefault = _interopDefault(transformCommonJS);

const validator = new OptionValidator("@babel/preset-typescript");
function normalizeOptions(options = {}) {
  const {
    allowNamespaces = true,
    jsxPragma,
    onlyRemoveTypeImports
  } = options;
  
  const validOptions = {
    jsxPragmaFrag: validator.validateStringOption("jsxPragmaFrag", options.jsxPragmaFrag, "React.Fragment"),
    allExtensions: validator.validateBooleanOption("allExtensions", options.allExtensions, false),
    isTSX: validator.validateBooleanOption("isTSX", options.isTSX, false),
    ignoreExtensions: validator.validateBooleanOption("ignoreExtensions", options.ignoreExtensions, false),
    disallowAmbiguousJSXLike: validator.validateBooleanOption("disallowAmbiguousJSXLike", options.disallowAmbiguousJSXLike, false),
    optimizeConstEnums: validator.validateBooleanOption("optimizeConstEnums", options.optimizeConstEnums, false),
    rewriteImportExtensions: validator.validateBooleanOption("rewriteImportExtensions", options.rewriteImportExtensions, false),
  };

  if (validOptions.isTSX) {
    validator.invariant(validOptions.allExtensions, "isTSX:true requires allExtensions:true");
  }
  
  if (validOptions.disallowAmbiguousJSXLike) {
    validator.invariant(validOptions.allExtensions, "disallowAmbiguousJSXLike:true requires allExtensions:true");
  }
  
  return {
    ...validOptions,
    allowNamespaces,
    jsxPragma,
    onlyRemoveTypeImports,
  };
}

const rewriteTSImportsPlugin = declare(({ types: t }) => ({
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
}));

const preset = declarePreset((api, opts) => {
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

  const pluginOptions = (disallowAmbiguousJSXLike) => ({
    allowDeclareFields: opts.allowDeclareFields,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
  });

  const getPlugins = (isTSX, disallowAmbiguousJSXLike) => [
    [transformTSDefault.default, { ...pluginOptions(disallowAmbiguousJSXLike), isTSX }]
  ];

  const disableExtDetect = allExtensions || ignoreExtensions;

  return {
    plugins: rewriteImportExtensions ? [rewriteTSImportsPlugin] : [],
    overrides: disableExtDetect ? [{
      plugins: getPlugins(isTSX, disallowAmbiguousJSXLike),
    }] : [{
      test: /\.ts$/,
      plugins: getPlugins(false, false),
    }, {
      test: /\.mts$/,
      sourceType: "module",
      plugins: getPlugins(false, true),
    }, {
      test: /\.cts$/,
      sourceType: "unambiguous",
      plugins: [
        [transformCommonJSDefault.default, { allowTopLevelThis: true }],
        [transformTSDefault.default, pluginOptions(true)],
      ],
    }, {
      test: /\.tsx$/,
      plugins: getPlugins(true, false),
    }],
  };
});

exports.default = preset;
