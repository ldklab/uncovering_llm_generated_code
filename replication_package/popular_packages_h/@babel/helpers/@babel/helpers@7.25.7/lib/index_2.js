"use strict";

const { cloneNode, identifier } = require("@babel/types");
const _helpersGenerated = require("./helpers-generated.js");

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
  
  adjustAst?.(ast, exportName, map => {
    exportBindingAssignments.forEach(p => deep(ast, p, map(deep(ast, p))));
  });
}

const helperData = Object.create(null);

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

function get(name, getDependency, bindingName, localBindings, adjustAst) {
  if (typeof bindingName === "object") {
    const id = bindingName;
    bindingName = id?.type === "Identifier" ? id.name : undefined;
  }
  return loadHelper(name).build(getDependency, bindingName, localBindings, adjustAst);
}

function minVersion(name) {
  return loadHelper(name).minVersion;
}

function getDependencies(name) {
  return loadHelper(name).getDependencies();
}

const ensure = name => {
  loadHelper(name);
};

const list = Object.keys(_helpersGenerated.default).map(name => name.replace(/^_/, ""));

exports.default = get;
exports.get = get;
exports.minVersion = minVersion;
exports.getDependencies = getDependencies;
exports.list = list;
exports.ensure = ensure;
