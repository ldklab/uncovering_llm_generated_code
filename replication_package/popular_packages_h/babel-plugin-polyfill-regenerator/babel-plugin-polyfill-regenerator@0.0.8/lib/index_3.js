"use strict";

// Export the module definition with a default export
exports.__esModule = true;
exports.default = void 0;

// Import the babel helper to define a polyfill provider
const _helperDefinePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));

// Helper function to handle module imports
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}

// Define the default export using the polyfill provider
const _default = (0, _helperDefinePolyfillProvider.default)(({ debug }) => {
  return {
    // Define the name of the polyfill provider
    name: "regenerator",
    
    // Define the polyfills associated with this provider
    polyfills: ["regenerator-runtime"],

    // Method to handle global usage of the polyfill
    usageGlobal(meta, utils) {
      if (isRegenerator(meta)) {
        debug("regenerator-runtime");
        utils.injectGlobalImport("regenerator-runtime/runtime");
      }
    },

    // Method to handle pure (modular) usage of the polyfill
    usagePure(meta, utils, path) {
      if (isRegenerator(meta)) {
        path.replaceWith(utils.injectDefaultImport("regenerator-runtime"));
      }
    }
  };
});

// Export the default provider
exports.default = _default;

// Function to check if the metadata corresponds to regenerator
const isRegenerator = (meta) => meta.kind === "global" && meta.name === "regeneratorRuntime";
