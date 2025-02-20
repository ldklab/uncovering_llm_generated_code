"use strict";

// Import state management for defining exported modules
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Import helper utility for creating Babel plugins
var _helperPluginUtils = require("@babel/helper-plugin-utils");

// Import React JSX transformation plugins
var _pluginTransformReactJsx = _interopRequireDefault(require("@babel/plugin-transform-react-jsx"));
var _pluginTransformReactJsxDevelopment = _interopRequireDefault(require("@babel/plugin-transform-react-jsx-development"));
var _pluginTransformReactDisplayName = _interopRequireDefault(require("@babel/plugin-transform-react-display-name"));
var _pluginTransformReactPureAnnotations = _interopRequireDefault(require("@babel/plugin-transform-react-pure-annotations"));

// Helper function that handles importing modules as default
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Main export function using Babel's declare function to manage API and options
var _default = (0, _helperPluginUtils.declare)((api, opts) => {
  // Ensure the Babel version is 7
  api.assertVersion(7);
  
  // Destructure options for ease of use
  let {
    pragma,
    pragmaFrag
  } = opts;

  // Set default options and development flags
  const {
    pure,
    throwIfNamespace = true,
    runtime = "classic",
    importSource
  } = opts;

  // Default pragma settings for classic runtime
  if (runtime === "classic") {
    pragma = pragma || "React.createElement";
    pragmaFrag = pragmaFrag || "React.Fragment";
  }

  // Flag indicating if development environment is enabled
  const development = !!opts.development;

  // Returns a list of Babel plugins to use
  return {
    plugins: [
      [
        development ? _pluginTransformReactJsxDevelopment.default : _pluginTransformReactJsx.default, 
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
      _pluginTransformReactDisplayName.default, 
      pure !== false && _pluginTransformReactPureAnnotations.default
    ].filter(Boolean) // Remove any falsy values from plugins list
  };
});

// Exporting the default function
exports.default = _default;
