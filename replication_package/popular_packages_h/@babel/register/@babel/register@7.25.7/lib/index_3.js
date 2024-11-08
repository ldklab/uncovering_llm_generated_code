const node = require("./nodeWrapper.js");
const register = node.default;

// Export a function that registers using arguments passed to it
function exportFunction(...args) {
  return register(...args);
}

// Mark the export as ESModule compatible
exportFunction.__esModule = true;

// Combine all exports from nodeWrapper.js with the exportFunction
Object.assign(exportFunction, node);

// Use module.exports to expose the function
module.exports = exportFunction;

//# sourceMappingURL=index.js.map
