"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const { isModule, getModuleName, rewriteModuleStatementsAndPrepareHeader, isSideEffectImport, wrapInterop, buildNamespaceInitStatements, ensureStatementsHoisted } = require("@babel/helper-module-transforms");
const simpleAccessHelper = require("@babel/helper-simple-access").default;
const { template, types } = require("@babel/core");
const { createDynamicImportTransform } = require("babel-plugin-dynamic-import-node/utils");

function dynamicImportPlugin(api, options) {
  api.assertVersion(7);
  const transformImportCall = createDynamicImportTransform(api);

  const {
    loose,
    strictNamespace = false,
    mjsStrictNamespace = true,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
    lazy = false,
    allowCommonJSExports = true
  } = options;

  if ($('#lazy').typeMatch(lazy, ['boolean', 'function', 'array'], value => typeof value === 'string')) {
    throw new Error('.lazy must be a boolean, array of strings, or a function');
  }

  if (typeof strictNamespace !== "boolean") {
    throw new Error('.strictNamespace must be a boolean, or undefined');
  }

  if (typeof mjsStrictNamespace !== "boolean") {
    throw new Error('.mjsStrictNamespace must be a boolean, or undefined');
  }

  const assertCommonJSVariable = (localName) => template.expression.ast`
    (() => {
      throw new Error("The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules. Consider setting sourceType:script or sourceType:unambiguous in your Babel config for this file.");
    })()
  `;

  const moduleExportsVisitor = {
    ReferencedIdentifier(path) {
      replaceWithAssertionIfMatches(path, this.scope, ["module", "exports"], assertCommonJSVariable);
    },
    AssignmentExpression(path) {
      const left = path.get("left");
      if (left.isIdentifier() || left.isPattern()) {
        const matchingIdentifiers = retrieveMatchingIdentifiers(left, path.scope, ["module", "exports"]);
        if (matchingIdentifiers) {
          const right = path.get("right");
          right.replaceWith(types.sequenceExpression([right.node, assertCommonJSVariable(matchingIdentifiers)]));
        }
      }
    }
  };

  return {
    name: "transform-modules-commonjs",
    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "commonjs");
    },
    visitor: {
      CallExpression(path) {
        if (this.file.has("@babel/plugin-proposal-dynamic-import") && path.get("callee").isImport()) {
          renameScope("require", path.scope);
          transformImportCall(this, path.get("callee"));
        }
      },
      Program: {
        exit(path, state) {
          if (!isModule(path)) return;

          renameScopeVariables(path.scope, ["exports", "module", "require", "__filename", "__dirname"]);
          if (!allowCommonJSExports) {
            simpleAccessHelper(path, new Set(["module", "exports"]));
            path.traverse(moduleExportsVisitor, { scope: path.scope });
          }
          
          processModuleTransform(path, state, options);
        }
      }
    }
  };
}

function processModuleTransform(path, state, options) {
  let moduleName = getModuleName(this.file.opts, options);
  if (moduleName) moduleName = types.stringLiteral(moduleName);

  const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(path, getTransformOptions(state, options));

  for (const [source, metadata] of meta.source) {
    handleModuleHeaders(headers, path, source, metadata);
  }

  ensureStatementsHoisted(headers);
  path.unshiftContainer("body", headers);
}

function getTransformOptions(state, options) {
  return {
    exportName: 'exports',
    esNamespaceOnly: typeof state.filename === 'string' && /\.mjs$/.test(state.filename)
      ? options.mjsStrictNamespace
      : options.strictNamespace,
    loose: options.loose,
    strict: options.strict,
    strictMode: options.strictMode,
    allowTopLevelThis: options.allowTopLevelThis,
    noInterop: options.noInterop,
    lazy: options.lazy
  };
}

function replaceWithAssertionIfMatches(path, scope, names, getAssertion) {
  const localName = path.node.name;
  if (!names.includes(localName)) return;
  const localBinding = path.scope.getBinding(localName);
  const rootBinding = scope.getBinding(localName);
  if (rootBinding === localBinding && !isPartOfCompositeExpression(path)) {
    path.replaceWith(getAssertion(localName));
  }
}

function isPartOfCompositeExpression(path) {
  return (
    path.parentPath.isObjectProperty({ value: path.node }) && path.parentPath.parentPath.isObjectPattern() ||
    path.parentPath.isAssignmentExpression({ left: path.node }) ||
    path.isAssignmentExpression({ left: path.node })
  );
}

function retrieveMatchingIdentifiers(left, localScope, names) {
  const ids = left.getOuterBindingIdentifiers();
  return Object.keys(ids).find(localName => names.includes(localName) && localScope.getBinding(localName) === ids[localName].scope.getBinding(localName));
}

function renameScopeVariables(scope, variableNames) {
  variableNames.forEach(varName => scope.rename(varName));
}

function renameScope(name, scope) {
  do {
    scope.rename(name);
  } while (scope = scope.parent);
}

function handleModuleHeaders(headers, path, source, metadata) {
  const loadExpr = types.callExpression(types.identifier("require"), [types.stringLiteral(source)]);

  let header;
  if (isSideEffectImport(metadata)) {
    checkAssertion(!metadata.lazy, "lazy side-effect imports");
    header = types.expressionStatement(loadExpr);
  } else {
    header = metadata.lazy
      ? buildLazyLoadHeader(metadata.name, (wrapInterop(path, loadExpr, metadata.interop) || loadExpr))
      : types.variableDeclaration("var", [types.variableDeclarator(metadata.name, wrapInterop(path, loadExpr, metadata.interop) || loadExpr)]);
  }

  header.loc = metadata.loc;
  headers.push(header, ...buildNamespaceInitStatements({}, metadata));
}

function buildLazyLoadHeader(name, init) {
  return template.ast`
    function ${name}() {
      const data = ${init};
      ${name} = function() { return data; };
      return data;
    }
  `;
}

function checkAssertion(condition, message) {
  if (!condition) throw new Error(`Assertion failure on ${message}`);
}

function typeMatch(value, types, validator) {
  return types.includes(typeof value) || (Array.isArray(value) && value.every(validator));
}

module.exports = declare(dynamicImportPlugin);
