const node = require("./nodeWrapper.js");
const register = node.default;

function exportedFunction(...args) {
  return register(...args);
}

module.exports = exportedFunction;

// Indicate ES module compatibility
module.exports.__esModule = true;

// Assign all properties from node to exports
Object.assign(module.exports, node);

//# sourceMappingURL=index.js.map
