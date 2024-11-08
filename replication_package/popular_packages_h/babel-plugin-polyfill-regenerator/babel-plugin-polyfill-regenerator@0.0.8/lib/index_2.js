"use strict";

// Export the module as CommonJS module and set its default export
exports.__esModule = true;
exports.default = void 0;

// Import 'helper-define-polyfill-provider' from Babel
var _helperDefinePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));

// Used to properly handle default import in CommonJS environment
function _interopRequireDefault(obj) { 
    return obj && obj.__esModule ? obj : { default: obj }; 
}

// Define the default export using the Babel helper to create a polyfill provider
var _default = (0, _helperDefinePolyfillProvider.default)(({ debug }) => {
    return {
        // Name of the polyfill provider
        name: "regenerator",
        // List of polyfills associated with this provider
        polyfills: ["regenerator-runtime"],

        // Handler for global usage of features
        usageGlobal(meta, utils) {
            if (isRegenerator(meta)) { // Check if the meta indicates regenerator usage
                debug("regenerator-runtime"); // Output debug information
                utils.injectGlobalImport("regenerator-runtime/runtime"); // Inject necessary global import
            }
        },

        // Handler for pure usage of features (e.g., specific module imports)
        usagePure(meta, utils, path) {
            if (isRegenerator(meta)) { // Check if the meta indicates regenerator usage
                path.replaceWith(utils.injectDefaultImport("regenerator-runtime")); // Replace path with default import
            }
        }
    };
});

// Export the default configuration
exports.default = _default;

// Utility function to determine if given metadata indicates regenerator usage
const isRegenerator = meta => meta.kind === "global" && meta.name === "regeneratorRuntime";
