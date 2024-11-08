const node = require("./node");

const register = node.default;

function moduleFunction(...args) {
  return register(...args);
}

moduleFunction.__esModule = true;
Object.assign(moduleFunction, node);

module.exports = moduleFunction;
