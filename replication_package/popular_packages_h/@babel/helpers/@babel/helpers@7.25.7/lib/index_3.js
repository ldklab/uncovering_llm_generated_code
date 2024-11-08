"use strict";

// Import types and helpers
const { cloneNode, identifier } = require("@babel/types");
const helpersGenerated = require("./helpers-generated.js");

// Exported functions
exports.default = get;
exports.get = get;
exports.getDependencies = getDependencies;
exports.minVersion = minVersion;
exports.list = Object.keys(helpersGenerated.default).map(name => name.replace(/^_/, ""));

// Cache for helper data
const helperData = Object.create(null);

// Function to access nested properties with optional setting
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

// Handle AST manipulation based on helper metadata
function permuteHelperAST(ast, metadata, bindingName, localBindings, getDependency, adjustAst) {
  const { locals, dependencies, exportBindingAssignments, exportName } = metadata;
  const bindings = new Set(localBindings || []);
  if (bindingName) bindings.add(bindingName);

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

  for (const [name, paths] of Object.entries(dependencies)) {
    const ref = typeof getDependency === "function" ? getDependency(name) : identifier(name);
    for (const path of paths) {
      deep(ast, path, cloneNode(ref));
    }
  }

  if (adjustAst != null) {
    adjustAst(ast, exportName, map => {
      exportBindingAssignments.forEach(p => deep(ast, p, map(deep(ast, p))));
    });
  }
}

// Load and cache helper information
function loadHelper(name) {
  if (!helperData[name]) {
    const helper = helpersGenerated.default[name];
    if (!helper) {
      throw Object.assign(new ReferenceError(`Unknown helper ${name}`), {
        code: "BABEL_HELPER_UNKNOWN",
        helper: name
      });
    }
    helperData[name] = {
      minVersion: helper.minVersion,
      build(getDependency, bindingName, localBindings, adjustAst) {
        const ast = helper.ast();
        permuteHelperAST(ast, helper.metadata, bindingName, localBindings, getDependency, adjustAst);
        return {
          nodes: ast.body,
          globals: helper.metadata.globals
        };
      },
      getDependencies() {
        return Object.keys(helper.metadata.dependencies);
      }
    };
  }
  return helperData[name];
}

// Retrieve a helper with its metadata
function get(name, getDependency, bindingName, localBindings, adjustAst) {
  if (typeof bindingName === "object") {
    const id = bindingName;
    bindingName = id?.type === "Identifier" ? id.name : undefined;
  }
  return loadHelper(name).build(getDependency, bindingName, localBindings, adjustAst);
}

// Get minimum version of a helper
function minVersion(name) {
  return loadHelper(name).minVersion;
}

// Get all dependencies for a specific helper
function getDependencies(name) {
  return loadHelper(name).getDependencies();
}

// Additional exports
exports.ensure = name => loadHelper(name);
