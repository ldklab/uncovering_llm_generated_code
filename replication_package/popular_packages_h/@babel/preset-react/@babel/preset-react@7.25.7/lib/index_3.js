'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const { declarePreset } = require('@babel/helper-plugin-utils');
const jsxTransform = require('@babel/plugin-transform-react-jsx');
const jsxTransformDev = require('@babel/plugin-transform-react-jsx-development');
const displayName = require('@babel/plugin-transform-react-display-name');
const pureAnnotations = require('@babel/plugin-transform-react-pure-annotations');
const { OptionValidator } = require('@babel/helper-validator-option');

function loadModuleDefault(mod) {
  return mod && mod.__esModule ? mod : { default: mod };
}

const jsxTransformDefault = loadModuleDefault(jsxTransform);
const jsxTransformDevDefault = loadModuleDefault(jsxTransformDev);
const displayNameDefault = loadModuleDefault(displayName);
const pureAnnotationsDefault = loadModuleDefault(pureAnnotations);

new OptionValidator("@babel/preset-react");

function normalizeOptions(options = {}) {
  let { pragma, pragmaFrag, pure, throwIfNamespace = true, runtime = "classic", importSource, useBuiltIns, useSpread } = options;
  if (runtime === "classic") {
    pragma = pragma || "React.createElement";
    pragmaFrag = pragmaFrag || "React.Fragment";
  }
  const development = !!options.development;
  return { development, importSource, pragma, pragmaFrag, pure, runtime, throwIfNamespace, useBuiltIns, useSpread };
}

const presetReact = declarePreset((api, opts) => {
  api.assertVersion(7);
  const { development, importSource, pragma, pragmaFrag, pure, runtime, throwIfNamespace } = normalizeOptions(opts);
  return {
    plugins: [
      [
        development ? jsxTransformDevDefault.default : jsxTransformDefault.default, 
        { importSource, pragma, pragmaFrag, runtime, throwIfNamespace, pure, useBuiltIns: !!opts.useBuiltIns, useSpread: opts.useSpread }
      ], 
      displayNameDefault.default, 
      pure !== false && pureAnnotationsDefault.default
    ].filter(Boolean)
  };
});

exports.default = presetReact;
//# sourceMappingURL=index.js.map
