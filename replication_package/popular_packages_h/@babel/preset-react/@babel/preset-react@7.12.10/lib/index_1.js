"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var { declare } = require("@babel/helper-plugin-utils");
var transformReactJsx = require("@babel/plugin-transform-react-jsx").default;
var transformReactJsxDevelopment = require("@babel/plugin-transform-react-jsx-development").default;
var transformReactDisplayName = require("@babel/plugin-transform-react-display-name").default;
var transformReactPureAnnotations = require("@babel/plugin-transform-react-pure-annotations").default;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var _default = declare((api, opts) => {
  api.assertVersion(7);

  let { pragma, pragmaFrag } = opts;
  const { pure, throwIfNamespace = true, runtime = "classic", importSource } = opts;

  if (runtime === "classic") {
    pragma = pragma || "React.createElement";
    pragmaFrag = pragmaFrag || "React.Fragment";
  }

  const development = !!opts.development;

  return {
    plugins: [
      [
        development ? transformReactJsxDevelopment : transformReactJsx,
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
      transformReactDisplayName,
      pure !== false && transformReactPureAnnotations
    ].filter(Boolean)
  };
});

exports.default = _default;
