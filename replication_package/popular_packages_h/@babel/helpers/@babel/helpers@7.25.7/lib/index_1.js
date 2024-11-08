"use strict";

// Setup imports
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
exports.get = get;
exports.getDependencies = getDependencies;
exports.list = void 0;
exports.minVersion = minVersion;

var _t = require("@babel/types"); // Import Babel type utilities
var _helpersGenerated = require("./helpers-generated.js"); // Import generated helper module

const { cloneNode, identifier } = _t;

// Utility to deeply access or set a property using dot-separated path
function deep(obj, path, value) {
  try {
    const parts = path.split(".");
    let last = parts.shift();
    while (parts.length > 0) {
      obj = obj[last];
      last = parts.shift();
    }
    if (arguments.length > 2) {
      obj[last] = value;
    } else {
      return obj[last];
    }
  } catch (e) {
    e.message += ` (when accessing ${path})`;
    throw e;
  }
}

// Function to adjust names and references within a helper's AST
function permuteHelperAST(ast, metadata, bindingName, localBindings, getDependency, adjustAst) {
  const { locals, dependencies, exportBindingAssignments, exportName } = metadata;
  const bindings = new Set(localBindings || []);
  if (bindingName) bindings.add(bindingName);

  // Adjust local bindings
  for (const [name, paths] of Object.entries(locals)) {
    let newName = name;
    if (bindingName && name === exportName) {
      newName = bindingName;
    } else {
      while (bindings.has(newName)) newName = "_" + newName;
    }
    if (newName !== name) {
      for (const path of paths) {
        deep(ast, path, identifier(newName));
      }
    }
  }

  // Adjust dependencies
  for (const [name, paths] of Object.entries(dependencies)) {
    const ref = typeof getDependency === "function" && getDependency(name) || identifier(name);
    for (const path of paths) {
      deep(ast, path, cloneNode(ref));
    }
  }

  // Adjust the AST post-processing
  adjustAst == null || adjustAst(ast, exportName, map => {
    exportBindingAssignments.forEach(p => deep(ast, p, map(deep(ast, p))));
  });
}

const helperData = Object.create(null); // Cache for loaded helpers

// Load a helper by name, or throw an error if not found
function loadHelper(name) {
  if (!helperData[name]) {
    const helper = _helpersGenerated.default[name];
    if (!helper) {
      throw Object.assign(new ReferenceError(`Unknown helper ${name}`), {
        code: "BABEL_HELPER_UNKNOWN",
        helper: name
      });
    }
    helperData[name] = {
      minVersion: helper.minVersion, // Store the minimum version
      build(getDependency, bindingName, localBindings, adjustAst) {
        const ast = helper.ast(); // Retrieve AST
        permuteHelperAST(ast, helper.metadata, bindingName, localBindings, getDependency, adjustAst);
        return {
          nodes: ast.body, // Return the body of the AST
          globals: helper.metadata.globals // Return globals if any
        };
      },
      getDependencies() {
        return Object.keys(helper.metadata.dependencies); // List external dependencies
      }
    };
  }
  return helperData[name];
}

// Exported function to get a constructed AST helper
function get(name, getDependency, bindingName, localBindings, adjustAst) {
  if (typeof bindingName === "object") {
    const id = bindingName;
    if ((id == null ? void 0 : id.type) === "Identifier") {
      bindingName = id.name;
    } else {
      bindingName = undefined;
    }
  }
  return loadHelper(name).build(getDependency, bindingName, localBindings, adjustAst);
}

// Exported function to get the minimum version required for a helper
function minVersion(name) {
  return loadHelper(name).minVersion;
}

// Exported function to get a helper's dependencies
function getDependencies(name) {
  return loadHelper(name).getDependencies();
}

{ 
  // Exported function to ensure a helper is loaded
  exports.ensure = name => {
    loadHelper(name);
  };
}

// Export a list of stripped helper names
const list = exports.list = Object.keys(_helpersGenerated.default).map(name => name.replace(/^_/, ""));
var _default = exports.default = get; // Default export

//# sourceMappingURL=index.js.map
