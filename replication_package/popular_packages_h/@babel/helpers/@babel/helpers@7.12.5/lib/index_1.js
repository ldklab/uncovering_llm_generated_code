"use strict";

const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const helpers = require("./helpers").default;

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.list = void 0;
exports.get = get;
exports.minVersion = minVersion;
exports.getDependencies = getDependencies;
exports.ensure = ensure;

let fileClass;
const helperData = Object.create(null);

function getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  return new WeakMap();
}

function interopRequireWildcard(obj) {
  if (obj && obj.__esModule) return obj;
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return { default: obj };
  const cache = getRequireWildcardCache();
  if (cache && cache.has(obj)) return cache.get(obj);
  const newObj = {}, hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
      else newObj[key] = obj[key];
    }
  }
  newObj.default = obj;
  if (cache) cache.set(obj, newObj);
  return newObj;
}

function interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function makePath(path) {
  const parts = [];
  while (path.parentPath) {
    parts.push(path.key);
    if (path.inList) parts.push(path.listKey);
    path = path.parentPath;
  }
  return parts.reverse().join(".");
}

function getHelperMetadata(file) {
  const globals = new Set(), localBindingNames = new Set();
  const dependencies = new Map(), exportBindingAssignments = [];
  const importPaths = [], importBindingsReferences = [];
  let exportName, exportPath;

  const dependencyVisitor = {
    ImportDeclaration(child) {
      const name = child.node.source.value;
      if (!helpers[name]) {
        throw child.buildCodeFrameError(`Unknown helper ${name}`);
      }
      if (child.get("specifiers").length !== 1 || !child.get("specifiers.0").isImportDefaultSpecifier()) {
        throw child.buildCodeFrameError("Helpers can only import a default value");
      }
      const bindingIdentifier = child.node.specifiers[0].local;
      dependencies.set(bindingIdentifier, name);
      importPaths.push(makePath(child));
    },

    ExportDefaultDeclaration(child) {
      const decl = child.get("declaration");
      if (decl.isFunctionDeclaration() && !decl.node.id) {
        throw decl.buildCodeFrameError("Helpers should give names to their exported func declaration");
      }
      exportName = decl.node.id && decl.node.id.name;
      exportPath = makePath(child);
    },

    ExportAllDeclaration(child) {
      throw child.buildCodeFrameError("Helpers can only export default");
    },

    ExportNamedDeclaration(child) {
      throw child.buildCodeFrameError("Helpers can only export default");
    },

    Statement(child) {
      if (child.isModuleDeclaration()) return;
      child.skip();
    }
  };

  const referenceVisitor = {
    Program(path) {
      const bindings = path.scope.getAllBindings();
      Object.keys(bindings).forEach(name => {
        if (name !== exportName && !dependencies.has(bindings[name].identifier)) {
          localBindingNames.add(name);
        }
      });
    },

    ReferencedIdentifier(child) {
      const name = child.node.name;
      const binding = child.scope.getBinding(name, true);
      binding ? dependencies.has(binding.identifier) && importBindingsReferences.push(makePath(child)) : globals.add(name);
    },

    AssignmentExpression(child) {
      const left = child.get("left");
      if (!(exportName in left.getBindingIdentifiers())) return;
      if (!left.isIdentifier()) {
        throw left.buildCodeFrameError("Only simple assignments to exports are allowed in helpers");
      }
      const binding = child.scope.getBinding(exportName);
      if (binding?.scope.path.isProgram()) {
        exportBindingAssignments.push(makePath(child));
      }
    }
  };

  traverse(file.ast, dependencyVisitor, file.scope);
  traverse(file.ast, referenceVisitor, file.scope);
  if (!exportPath) throw new Error("Helpers must default-export something.");
  exportBindingAssignments.reverse();

  return {
    globals: Array.from(globals),
    localBindingNames: Array.from(localBindingNames),
    dependencies,
    exportBindingAssignments,
    exportPath,
    exportName,
    importBindingsReferences,
    importPaths
  };
}

function permuteHelperAST(file, metadata, id, localBindings, getDependency) {
  if (!id) return;
  
  const { localBindingNames, dependencies, exportBindingAssignments, exportPath, exportName, importBindingsReferences, importPaths } = metadata;
  
  const dependenciesRefs = {};
  dependencies.forEach((name, id) => {
    dependenciesRefs[id.name] = (typeof getDependency === "function" && getDependency(name)) || id;
  });

  const toRename = {};
  const bindings = new Set(localBindings || []);
  localBindingNames.forEach(name => {
    let newName = name;
    while (bindings.has(newName)) newName = "_" + newName;
    if (newName !== name) toRename[name] = newName;
  });

  if (id.type === "Identifier" && exportName !== id.name) {
    toRename[exportName] = id.name;
  }

  const visitor = {
    Program(path) {
      const exp = path.get(exportPath);
      const decl = exp.get("declaration");

      if (id.type === "Identifier") {
        exp.replaceWith(decl.isFunctionDeclaration() ? decl : t.variableDeclaration("var", [t.variableDeclarator(id, decl.node)]));
      } else if (id.type === "MemberExpression") {
        exportBindingAssignments.forEach(assignPath => {
          const assign = path.get(assignPath);
          assign.replaceWith(t.assignmentExpression("=", id, assign.node));
        });
        exp.replaceWith(decl.isFunctionDeclaration() ? decl : t.expressionStatement(t.assignmentExpression("=", id, decl.node)));
        path.pushContainer("body", t.expressionStatement(t.assignmentExpression("=", id, t.identifier(exportName))));
      } else {
        throw new Error("Unexpected helper format.");
      }

      Object.keys(toRename).forEach(name => {
        path.scope.rename(name, toRename[name]);
      });

      importPaths.map(p => path.get(p)).forEach(p => p.remove());
      importBindingsReferences.map(p => path.get(p)).forEach(p => p.replaceWith(t.cloneNode(dependenciesRefs[p.node.name])));
      
      path.stop();
    }
  };

  traverse(file.ast, visitor, file.scope);
}

function loadHelper(name) {
  if (helperData[name]) return helperData[name];

  const helper = helpers[name];
  if (!helper) {
    throw new ReferenceError(`Unknown helper ${name}`);
  }

  const createFile = () => ({
    ast: t.file(helper.ast())
  });

  const fn = fileClass ? () => new fileClass({ filename: `babel-helper://${name}` }, createFile()) : createFile;
  const metadata = getHelperMetadata(fn());
  
  helperData[name] = {
    build(getDependency, id, localBindings) {
      const file = fn();
      permuteHelperAST(file, metadata, id, localBindings, getDependency);
      return { nodes: file.ast.program.body, globals: metadata.globals };
    },
    minVersion() {
      return helper.minVersion;
    },
    dependencies: metadata.dependencies
  };

  return helperData[name];
}

function get(name, getDependency, id, localBindings) {
  return loadHelper(name).build(getDependency, id, localBindings);
}

function minVersion(name) {
  return loadHelper(name).minVersion();
}

function getDependencies(name) {
  return Array.from(loadHelper(name).dependencies.values());
}

function ensure(name, newFileClass) {
  if (!fileClass) fileClass = newFileClass;
  loadHelper(name);
}

const list = Object.keys(helpers).map(name => name.replace(/^_/, "")).filter(name => name !== "__esModule");
exports.list = list;
exports.default = get;
