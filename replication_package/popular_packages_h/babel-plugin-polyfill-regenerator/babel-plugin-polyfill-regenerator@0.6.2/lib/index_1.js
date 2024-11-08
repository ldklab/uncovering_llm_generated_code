"use strict";

// Exporting the default module
exports.__esModule = true;
exports.default = void 0;

// Importing the helper function to define a polyfill provider
var _helperDefinePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));

// Function to handle module import default
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}

// Define a runtime compatibility string
const runtimeCompat = "#__secret_key__@babel/runtime__compatibility";

// Default export of a function using the imported polyfill provider
var _default = (0, _helperDefinePolyfillProvider.default)(({
  debug,
  targets,
  babel
}, options) => {
  // Check if the targets have changed, and throw an error if they have
  if (!shallowEqual(targets, babel.targets())) {
    throw new Error(
      "This plugin does not use the targets option. Only preset-env's targets" +
      " or top-level targets need to be configured for this plugin to work." +
      " See https://github.com/babel/babel-polyfills/issues/36 for more" +
      " details."
    );
  }
  
  // Destructure runtime compatibility options
  const {
    [runtimeCompat]: {
      moduleName = null,
      useBabelRuntime = false
    } = {}
  } = options;

  // Return a configuration object for regenerator
  return {
    name: "regenerator",
    polyfills: ["regenerator-runtime"],
    
    // Handle global usage of a polyfill
    usageGlobal(meta, utils) {
      if (isRegenerator(meta)) {
        debug("regenerator-runtime");
        utils.injectGlobalImport("regenerator-runtime/runtime.js");
      }
    },

    // Handle pure usage of a polyfill
    usagePure(meta, utils, path) {
      if (isRegenerator(meta)) {
        let pureName = "regenerator-runtime";
        
        // Modify the import path if Babel runtime is used
        if (useBabelRuntime) {
          var _ref;
          const runtimeName = (_ref = moduleName != null ? moduleName : path.hub.file.get("runtimeHelpersModuleName")) != null ? _ref : "@babel/runtime";
          pureName = `${runtimeName}/regenerator`;
        }
        
        // Inject an import statement for the regenerator runtime
        path.replaceWith(utils.injectDefaultImport(pureName, "regenerator-runtime"));
      }
    }
  };
});

exports.default = _default;

// Check if the given meta represents the regenerator
const isRegenerator = meta => meta.kind === "global" && meta.name === "regeneratorRuntime";

// Function to shallowly compare two objects
function shallowEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
