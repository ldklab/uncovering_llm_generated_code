'use strict';

const { declarePreset } = require('@babel/helper-plugin-utils');
const transformReactJSX = require('@babel/plugin-transform-react-jsx');
const transformReactJSXDevelopment = require('@babel/plugin-transform-react-jsx-development');
const transformReactDisplayName = require('@babel/plugin-transform-react-display-name');
const transformReactPure = require('@babel/plugin-transform-react-pure-annotations');
const { OptionValidator } = require('@babel/helper-validator-option');

function _interopDefault(e) {
  return e && e.__esModule ? e : { default: e };
}

const transformReactJSX__default = _interopDefault(transformReactJSX);
const transformReactJSXDevelopment__default = _interopDefault(transformReactJSXDevelopment);
const transformReactDisplayName__default = _interopDefault(transformReactDisplayName);
const transformReactPure__default = _interopDefault(transformReactPure);

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

  const { development, importSource, pragma, pragmaFrag, pure, runtime, throwIfNamespace } = normalizeOptions(opts);

  return {
    plugins: [
      [
        development ? transformReactJSXDevelopment__default.default : transformReactJSX__default.default, 
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
      transformReactDisplayName__default.default,
      pure !== false && transformReactPure__default.default
    ].filter(Boolean)
  };
});

exports.default = index;
//# sourceMappingURL=index.js.map
