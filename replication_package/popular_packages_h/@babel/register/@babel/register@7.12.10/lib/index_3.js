const node = require("./node");

function exportedFunction(...args) {
  return node.default(...args);
}

exportedFunction.__esModule = true;

Object.assign(exportedFunction, node);

module.exports = exportedFunction;
