const node = require("./node");

const register = node.default;

function mainFunction(...args) {
  return register(...args);
}

mainFunction.__esModule = true;

Object.assign(mainFunction, node);

module.exports = mainFunction;
