const node = require("./nodeWrapper.js");

// Define a function `registerWrapper` that applies `register` function from `nodeWrapper.js` module
function registerWrapper(...args) {
  return node.default(...args);
}

// Export the function as the module's default export and set `__esModule` for interop compatibility
module.exports = registerWrapper;
module.exports.__esModule = true;

// Assign all named exports from `nodeWrapper.js` into the module.exports
Object.assign(module.exports, node);

//# sourceMappingURL=index.js.map
