'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const helperPluginUtils = require('@babel/helper-plugin-utils');
const transformReactJSX = require('@babel/plugin-transform-react-jsx');
const transformReactJSXDevelopment = require('@babel/plugin-transform-react-jsx-development');
const transformReactDisplayName = require('@babel/plugin-transform-react-display-name');
const transformReactPure = require('@babel/plugin-transform-react-pure-annotations');
const helperValidatorOption = require('@babel/helper-validator-option');

function ensureDefaultImport(module) {
  return module && module.__esModule ? module : { default: module };
}

const transformReactJSXDefault = ensureDefaultImport(transformReactJSX);
const transformReactJSXDevelopmentDefault = ensureDefaultImport(transformReactJSXDevelopment);
const transformReactDisplayNameDefault = ensureDefaultImport(transformReactDisplayName);
const transformReactPureDefault = ensureDefaultImport(transformReactPure);

new helperValidatorOption.OptionValidator("@babel/preset-react");
function normalizeOptions(options = {}) {
  let { pragma, pragmaFrag } = options;
  const { pure, throwIfNamespace = true, runtime = "classic", importSource, useBuiltIns, useSpread } = options;
  if (runtime === "classic") {
    pragma = pragma || "React.createElement";
    pragmaFrag = pragmaFrag || "React.Fragment";
  }
  const development = !!options.development;
  return {
    development,
    importSource,
    pragma,
    pragmaFrag,
    pure,
    runtime,
    throwIfNamespace,
    useBuiltIns,
    useSpread
  };
}

const presetReact = helperPluginUtils.declarePreset((api, options) => {
  api.assertVersion(7);
  const { development, importSource, pragma, pragmaFrag, pure, runtime, throwIfNamespace } = normalizeOptions(options);
  return {
    plugins: [
      [
        development ? transformReactJSXDevelopmentDefault.default : transformReactJSXDefault.default, {
          importSource,
          pragma,
          pragmaFrag,
          runtime,
          throwIfNamespace,
          pure,
          useBuiltIns: !!options.useBuiltIns,
          useSpread: options.useSpread
        }
      ],
      transformReactDisplayNameDefault.default,
      pure !== false && transformReactPureDefault.default
    ].filter(Boolean)
  };
});

exports.default = presetReact;
//# sourceMappingURL=index.js.map
