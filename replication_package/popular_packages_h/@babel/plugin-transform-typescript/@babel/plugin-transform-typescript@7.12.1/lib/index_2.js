"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const syntaxTypeScript = require("@babel/plugin-syntax-typescript").default;
const babelCore = require("@babel/core");
const { injectInitialization } = require("@babel/helper-create-class-features-plugin");
const processEnum = require("./enum").default;
const processNamespace = require("./namespace").default;

function isInType(path) {
  switch (path.parent.type) {
    case "TSTypeReference":
    case "TSQualifiedName":
    case "TSExpressionWithTypeArguments":
    case "TSTypeQuery":
      return true;
    case "ExportSpecifier":
      return path.parentPath.parent.exportKind === "type";
    default:
      return false;
  }
}

const PARSED_PARAMS = new WeakSet();
const GLOBAL_TYPES = new WeakMap();

function isGlobalType(path, name) {
  const program = path.find(path => path.isProgram()).node;
  if (path.scope.hasOwnBinding(name)) return false;
  if (GLOBAL_TYPES.get(program).has(name)) return true;
  console.warn(`The exported identifier "${name}" is not declared in Babel's scope tracker\n` +
               'as a JavaScript value binding, and "@babel/plugin-transform-typescript"\n' +
               'never encountered it as a TypeScript type declaration.\n' +
               'It will be treated as a JavaScript value.\n\n' +
               'This problem is likely caused by another plugin injecting\n' +
               `"${name}" without registering it in the scope tracker. If you are the author\n` +
               ' of that plugin, please use "scope.registerDeclaration(declarationPath)".');
  return false;
}

function registerGlobalType(programScope, name) {
  GLOBAL_TYPES.get(programScope.path.node).add(name);
}

module.exports = declare((api, {
  jsxPragma = "React.createElement",
  jsxPragmaFrag = "React.Fragment",
  allowNamespaces = false,
  allowDeclareFields = false,
  onlyRemoveTypeImports = false
}) => {
  api.assertVersion(7);

  const JSX_PRAGMA_REGEX = /\*?\s*@jsx((?:Frag)?)\s+([^\s]+)/;

  return {
    name: "transform-typescript",
    inherits: syntaxTypeScript,
    visitor: {
      Program(path, state) {
        const { file } = state;
        let fileJsxPragma = null;
        let fileJsxPragmaFrag = null;

        if (!GLOBAL_TYPES.has(path.node)) {
          GLOBAL_TYPES.set(path.node, new Set());
        }

        if (file.ast.comments) {
          for (const comment of file.ast.comments) {
            const jsxMatches = JSX_PRAGMA_REGEX.exec(comment.value);

            if (jsxMatches) {
              if (jsxMatches[1]) {
                fileJsxPragmaFrag = jsxMatches[2];
              } else {
                fileJsxPragma = jsxMatches[2];
              }
            }
          }
        }

        let pragmaImportName = fileJsxPragma || jsxPragma;

        if (pragmaImportName) {
          [pragmaImportName] = pragmaImportName.split(".");
        }

        let pragmaFragImportName = fileJsxPragmaFrag || jsxPragmaFrag;

        if (pragmaFragImportName) {
          [pragmaFragImportName] = pragmaFragImportName.split(".");
        }

        for (let stmt of path.get("body")) {
          if (babelCore.types.isImportDeclaration(stmt)) {
            if (stmt.node.importKind === "type") {
              stmt.remove();
              continue;
            }

            let importsToRemove = [];
            let allElided = true;

            for (const specifier of stmt.node.specifiers) {
              const binding = stmt.scope.getBinding(specifier.local.name);

              if (binding && isImportTypeOnly({
                binding, programPath: path, pragmaImportName, pragmaFragImportName
              })) {
                importsToRemove.push(binding.path);
              } else {
                allElided = false;
              }
            }

            if (allElided) {
              stmt.remove();
            } else {
              importsToRemove.forEach(importPath => importPath.remove());
            }
            continue;
          }

          if (stmt.isExportDeclaration()) {
            stmt = stmt.get("declaration");
          }

          if (stmt.isVariableDeclaration({ declare: true })) {
            for (const name of Object.keys(stmt.getBindingIdentifiers())) {
              registerGlobalType(path.scope, name);
            }
          } else if (
            stmt.isTSTypeAliasDeclaration() ||
            stmt.isTSDeclareFunction() ||
            stmt.isTSInterfaceDeclaration() ||
            stmt.isClassDeclaration({ declare: true }) ||
            stmt.isTSEnumDeclaration({ declare: true }) ||
            stmt.isTSModuleDeclaration({ declare: true }) && stmt.get("id").isIdentifier()
          ) {
            registerGlobalType(path.scope, stmt.node.id.name);
          }
        }
      },

      ExportNamedDeclaration(path) {
        if (path.node.exportKind === "type") {
          path.remove();
          return;
        }

        if (
          !path.node.source &&
          path.node.specifiers.length > 0 &&
          path.node.specifiers.every(({ local }) => isGlobalType(path, local.name))
        ) {
          path.remove();
        }
      },

      ExportSpecifier(path) {
        if (!path.parent.source && isGlobalType(path, path.node.local.name)) {
          path.remove();
        }
      },

      ExportDefaultDeclaration(path) {
        if (babelCore.types.isIdentifier(path.node.declaration) && isGlobalType(path, path.node.declaration.name)) {
          path.remove();
        }
      },

      TSDeclareFunction(path) {
        path.remove();
      },

      TSDeclareMethod(path) {
        path.remove();
      },

      VariableDeclaration(path) {
        if (path.node.declare) {
          path.remove();
        }
      },

      VariableDeclarator({ node }) {
        if (node.definite) node.definite = null;
      },

      TSIndexSignature(path) {
        path.remove();
      },

      ClassDeclaration(path) {
        const { node } = path;

        if (node.declare) {
          path.remove();
          return;
        }
      },

      Class(path) {
        const { node } = path;
        if (node.typeParameters) node.typeParameters = null;
        if (node.superTypeParameters) node.superTypeParameters = null;
        if (node.implements) node.implements = null;
        if (node.abstract) node.abstract = null;

        path.get("body.body").forEach(child => {
          if (child.isClassMethod() || child.isClassPrivateMethod()) {
            if (child.node.kind === "constructor") {
              classMemberVisitors.constructor(child, path);
            } else {
              classMemberVisitors.method(child, path);
            }
          } else if (child.isClassProperty() || child.isClassPrivateProperty()) {
            classMemberVisitors.field(child, path);
          }
        });
      },

      Function({ node }) {
        if (node.typeParameters) node.typeParameters = null;
        if (node.returnType) node.returnType = null;
        const p0 = node.params[0];

        if (p0 && babelCore.types.isIdentifier(p0) && p0.name === "this") {
          node.params.shift();
        }

        node.params = node.params.map(p => {
          return p.type === "TSParameterProperty" ? p.parameter : p;
        });
      },

      TSModuleDeclaration(path) {
        processNamespace(path, babelCore.types, allowNamespaces);
      },

      TSInterfaceDeclaration(path) {
        path.remove();
      },

      TSTypeAliasDeclaration(path) {
        path.remove();
      },

      TSEnumDeclaration(path) {
        processEnum(path, babelCore.types);
      },

      TSImportEqualsDeclaration(path) {
        throw path.buildCodeFrameError("`import =` is not supported by @babel/plugin-transform-typescript\n" +
                                       "Please consider using `import <moduleName> from '<moduleName>';` alongside " +
                                       "Typescript's --allowSyntheticDefaultImports option.");
      },

      TSExportAssignment(path) {
        throw path.buildCodeFrameError("`export =` is not supported by @babel/plugin-transform-typescript\n" +
                                       "Please consider using `export <value>;`.");
      },

      TSTypeAssertion(path) {
        path.replaceWith(path.node.expression);
      },

      TSAsExpression(path) {
        let { node } = path;
        do {
          node = node.expression;
        } while (babelCore.types.isTSAsExpression(node));
        path.replaceWith(node);
      },

      TSNonNullExpression(path) {
        path.replaceWith(path.node.expression);
      },

      CallExpression(path) {
        path.node.typeParameters = null;
      },

      OptionalCallExpression(path) {
        path.node.typeParameters = null;
      },

      NewExpression(path) {
        path.node.typeParameters = null;
      },

      JSXOpeningElement(path) {
        path.node.typeParameters = null;
      },

      TaggedTemplateExpression(path) {
        path.node.typeParameters = null;
      }
    }
  };

  function visitPattern({ node }) {
    if (node.typeAnnotation) node.typeAnnotation = null;
    if (babelCore.types.isIdentifier(node) && node.optional) node.optional = null;
  }

  function isImportTypeOnly({ binding, programPath, pragmaImportName, pragmaFragImportName }) {
    for (const path of binding.referencePaths) {
      if (!isInType(path)) {
        return false;
      }
    }

    if (binding.identifier.name !== pragmaImportName && binding.identifier.name !== pragmaFragImportName) {
      return true;
    }

    let sourceFileHasJsx = false;
    programPath.traverse({
      "JSXElement|JSXFragment"(path) {
        sourceFileHasJsx = true;
        path.stop();
      }
    });
    return !sourceFileHasJsx;
  }
});
