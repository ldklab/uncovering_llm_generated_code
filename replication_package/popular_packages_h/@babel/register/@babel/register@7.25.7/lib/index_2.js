const node = require("./nodeWrapper.js");

function exportedFunction(...args) {
  return node.default(...args);
}

module.exports = exportedFunction;
module.exports.__esModule = true;
Object.assign(module.exports, node);

//# sourceMappingURL=index.js.map
