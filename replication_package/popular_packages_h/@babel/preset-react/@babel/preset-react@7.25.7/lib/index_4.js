'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const { declarePreset } = require('@babel/helper-plugin-utils');
const transformReactJSX = require('@babel/plugin-transform-react-jsx');
const transformReactJSXDevelopment = require('@babel/plugin-transform-react-jsx-development');
const transformReactDisplayName = require('@babel/plugin-transform-react-display-name');
const transformReactPure = require('@babel/plugin-transform-react-pure-annotations');
const { OptionValidator } = require('@babel/helper-validator-option');

function _interopDefault (module) { 
  return module && module.__esModule ? module : { default: module }; 
}

const transformReactJSXDefault = _interopDefault(transformReactJSX);
const transformReactJSXDevelopmentDefault = _interopDefault(transformReactJSXDevelopment);
const transformReactDisplayNameDefault = _interopDefault(transformReactDisplayName);
const transformReactPureDefault = _interopDefault(transformReactPure);

new OptionValidator("@babel/preset-react");

function normalizeOptions(options = {}) {
  let { pragma, pragmaFrag } = options;
  const {
    pure,
    throwIfNamespace = true,
    runtime = "classic",
    importSource,
    useBuiltIns,
    useSpread
  } = options;

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

const index = declarePreset((api, opts) => {
  api.assertVersion(7);

  const {
    development,
    importSource,
    pragma,
    pragmaFrag,
    pure,
    runtime,
    throwIfNamespace
  } = normalizeOptions(opts);

  return {
    plugins: [
      [
        development ? transformReactJSXDevelopmentDefault.default : transformReactJSXDefault.default,
        {
          importSource,
          pragma,
          pragmaFrag,
          runtime,
          throwIfNamespace,
          pure,
          useBuiltIns: !!opts.useBuiltIns,
          useSpread: opts.useSpread
        }
      ], 
      transformReactDisplayNameDefault.default, 
      pure !== false && transformReactPureDefault.default
    ].filter(Boolean)
  };
});

exports.default = index;
//# sourceMappingURL=index.js.map
