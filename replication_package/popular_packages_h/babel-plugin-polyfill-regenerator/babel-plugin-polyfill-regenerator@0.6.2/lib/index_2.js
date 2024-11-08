"use strict";

// Export the default module defined below
exports.__esModule = true;
exports.default = void 0;

// Import a function to define a polyfill provider from Babel
var _helperDefinePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));

// Utility function for handling default imports
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}

// Runtime compatibility constant
const runtimeCompat = "#__secret_key__@babel/runtime__compatibility";

// Define the polyfill provider function as the default export
var _default = (0, _helperDefinePolyfillProvider.default)(({
  debug,
  targets,
  babel
}, options) => {
  // Ensure that the targets match the Babel configuration
  if (!shallowEqual(targets, babel.targets())) {
    throw new Error("This plugin does not use the targets option. Only preset-env's targets" +
      " or top-level targets need to be configured for this plugin to work." +
      " See https://github.com/babel/babel-polyfills/issues/36 for more details.");
  }
  
  // Deconstruct options to get runtime compatibility settings
  const {
    [runtimeCompat]: {
      moduleName = null,
      useBabelRuntime = false
    } = {}
  } = options;

  // Return an object defining the polyfill provider configuration
  return {
    name: "regenerator",
    polyfills: ["regenerator-runtime"],
    
    // Define how global usage of the polyfill should be handled
    usageGlobal(meta, utils) {
      if (isRegenerator(meta)) {
        debug("regenerator-runtime");
        utils.injectGlobalImport("regenerator-runtime/runtime.js");
      }
    },

    // Define how pure usage of the polyfill should be handled
    usagePure(meta, utils, path) {
      if (isRegenerator(meta)) {
        let pureName = "regenerator-runtime";
        if (useBabelRuntime) {
          var _ref;
          const runtimeName = (_ref = moduleName != null ? moduleName : path.hub.file.get("runtimeHelpersModuleName")) != null ? _ref : "@babel/runtime";
          pureName = `${runtimeName}/regenerator`;
        }
        path.replaceWith(utils.injectDefaultImport(pureName, "regenerator-runtime"));
      }
    }
  };
});

// Export the defined polyfill provider as default
exports.default = _default;

// Helper function to determine if the metadata pertains to regenerator
const isRegenerator = meta => meta.kind === "global" && meta.name === "regeneratorRuntime";

// Helper function to perform a shallow equality check between two objects
function shallowEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
