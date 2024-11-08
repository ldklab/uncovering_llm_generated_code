"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const _exportNames = {
  react: true,
  // ... other export keys
};

function defineExport(name, module) {
  Object.defineProperty(exports, name, {
    enumerable: true,
    get: function () { return module.default; }
  });
}

// Manual export definitions
defineExport("__internal__deprecationWarning", require("./utils/deprecationWarning.js"));
defineExport("addComment", require("./comments/addComment.js"));
// ... other manual exports

// Dynamic re-exports for assorted modules
[
  require("./validators/react/isReactComponent.js"),
  require("./builders/react/buildChildren.js"),
  // ... other modules
].forEach(mod => {
  Object.keys(mod).forEach(key => {
    if (key === "default" || key === "__esModule" || key in _exportNames) return;
    if (key in exports && exports[key] === mod[key]) return;
    defineExport(key, mod);
  });
});

// Export react specific functions
const react = exports.react = {
  isReactComponent: require("./validators/react/isReactComponent.js").default,
  isCompatTag: require("./validators/react/isCompatTag.js").default,
  buildChildren: require("./builders/react/buildChildren.js").default
};

// Conditional exports based on environment variables
if (process.env.BABEL_TYPES_8_BREAKING) {
  console.warn("BABEL_TYPES_8_BREAKING is not supported anymore. Use the latest Babel 8.0.0 pre-release instead!");
}

//# sourceMappingURL=index.js.map
