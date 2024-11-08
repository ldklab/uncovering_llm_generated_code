"use strict";

const babelHelperUtils = require("@babel/helper-plugin-utils");
const syntaxTypescript = require("@babel/plugin-syntax-typescript").default;
const babelCore = require("@babel/core");
const createClassFeaturesPlugin = require("@babel/helper-create-class-features-plugin");
const transformEnum = require("./enum").default;
const transformNamespace = require("./namespace").default;

const PARSED_PARAMS = new WeakSet();
const GLOBAL_TYPES = new WeakMap();

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

function isGlobalType(path, name) {
  const program = path.find(path => path.isProgram()).node;
  if (path.scope.hasOwnBinding(name)) return false;
  if (GLOBAL_TYPES.get(program).has(name)) return true;
  console.warn(`The identifier "${name}" is considered a JavaScript value.`);
  return false;
}

function registerGlobalType(programScope, name) {
  GLOBAL_TYPES.get(programScope.path.node).add(name);
}

const transformTypescript = babelHelperUtils.declare((api, options) => {
  const {
    jsxPragma = "React.createElement",
    jsxPragmaFrag = "React.Fragment",
    allowNamespaces = false,
    allowDeclareFields = false,
    onlyRemoveTypeImports = false
  } = options;
  
  api.assertVersion(7);
  
  const classMemberVisitors = {
    field(path) {
      const { node } = path;
      if (!allowDeclareFields && node.declare) {
        throw path.buildCodeFrameError("Declare modifier needs allowDeclareFields option.");
      }
      if (node.declare) {
        if (node.value) throw path.buildCodeFrameError("Declare fields cannot be initialized.");
        if (!node.decorators) path.remove();
      } else if (!allowDeclareFields && !node.value && !node.decorators && !babelCore.types.isClassPrivateProperty(node)) {
        path.remove();
      }
      if (node.accessibility) node.accessibility = null;
      if (node.abstract) node.abstract = null;
      if (node.readonly) node.readonly = null;
      if (node.optional) node.optional = null;
      if (node.typeAnnotation) node.typeAnnotation = null;
      if (node.definite) node.definite = null;
      if (node.declare) node.declare = null;
    },
    method(path) {
      const { node } = path;
      if (node.accessibility) node.accessibility = null;
      if (node.abstract) node.abstract = null;
      if (node.optional) node.optional = null;
    },
    constructor(path, classPath) {
      const { node } = path;
      if (node.accessibility) node.accessibility = null;
      const parameterProperties = [];
      for (const param of node.params) {
        if (param.type === "TSParameterProperty" && !PARSED_PARAMS.has(param.parameter)) {
          PARSED_PARAMS.add(param.parameter);
          parameterProperties.push(param.parameter);
        }
      }
      if (parameterProperties.length) {
        const assigns = parameterProperties.map(param => {
          const id = babelCore.types.isIdentifier(param) ? param : param.left;
          return babelCore.template.statement.ast`
            this.${babelCore.types.cloneNode(id)} = ${babelCore.types.cloneNode(id)}`;
        });
        createClassFeaturesPlugin.injectInitialization(classPath, path, assigns);
      }
    }
  };
  
  function visitPattern(path) {
    if (path.node.typeAnnotation) path.node.typeAnnotation = null;
    if (babelCore.types.isIdentifier(path.node) && path.node.optional) path.node.optional = null;
  }
  
  function isImportTypeOnly({ binding, programPath, pragmaImportName, pragmaFragImportName }) {
    if (binding.identifier.name !== pragmaImportName && binding.identifier.name !== pragmaFragImportName) {
      return binding.referencePaths.every(refPath => isInType(refPath));
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
  
  return {
    name: "transform-typescript",
    inherits: syntaxTypescript,
    visitor: {
      Pattern: visitPattern,
      Identifier: visitPattern,
      RestElement: visitPattern,
      Program(path, state) {
        const { file } = state;
        let fileJsxPragma = null;
        let fileJsxPragmaFrag = null;
        if (!GLOBAL_TYPES.has(path.node)) {
          GLOBAL_TYPES.set(path.node, new Set());
        }
        if (file.ast.comments) {
          for (const comment of file.ast.comments) {
            const jsxMatches = comment.value.match(JSX_PRAGMA_REGEX);
            if (jsxMatches) {
              if (jsxMatches[1]) {
                fileJsxPragmaFrag = jsxMatches[2];
              } else {
                fileJsxPragma = jsxMatches[2];
              }
            }
          }
        }
        const pragmaImportName = (fileJsxPragma || jsxPragma).split(".")[0];
        const pragmaFragImportName = (fileJsxPragmaFrag || jsxPragmaFrag).split(".")[0];
        
        for (let statement of path.get("body")) {
          if (babelCore.types.isImportDeclaration(statement)) {
            if (statement.node.importKind === "type") {
              statement.remove();
              continue;
            }
            if (!onlyRemoveTypeImports) {
              if (statement.node.specifiers.length === 0) continue;

              let allElided = true;
              const importsToRemove = [];

              for (const specifier of statement.node.specifiers) {
                const binding = statement.scope.getBinding(specifier.local.name);
                if (binding && isImportTypeOnly({ binding, programPath: path, pragmaImportName, pragmaFragImportName })) {
                  importsToRemove.push(binding.path);
                } else {
                  allElided = false;
                }
              }

              if (allElided) {
                statement.remove();
              } else {
                for (const importPath of importsToRemove) {
                  importPath.remove();
                }
              }
            }
            continue;
          }

          if (statement.isExportDeclaration()) {
            statement = statement.get("declaration");
          }

          if (statement.isVariableDeclaration({ declare: true })) {
            for (const name of Object.keys(statement.getBindingIdentifiers())) {
              registerGlobalType(path.scope, name);
            }
          } else if (
            statement.isTSTypeAliasDeclaration() || 
            statement.isTSDeclareFunction() || 
            statement.isTSInterfaceDeclaration() || 
            statement.isClassDeclaration({ declare: true }) || 
            statement.isTSEnumDeclaration({ declare: true }) || 
            statement.isTSModuleDeclaration({ declare: true }) && statement.get("id").isIdentifier()
          ) {
            registerGlobalType(path.scope, statement.node.id.name);
          }
        }
      },
      ExportNamedDeclaration(path) {
        if (path.node.exportKind === "type") {
          path.remove();
          return;
        }
        if (!path.node.source && path.node.specifiers.length > 0 && path.node.specifiers.every(({ local }) => isGlobalType(path, local.name))) {
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
        const firstParam = node.params[0];
        if (firstParam && babelCore.types.isIdentifier(firstParam) && firstParam.name === "this") {
          node.params.shift();
        }
        node.params = node.params.map(param => param.type === "TSParameterProperty" ? param.parameter : param);
      },
      TSModuleDeclaration(path) {
        transformNamespace(path, babelCore.types, allowNamespaces);
      },
      TSInterfaceDeclaration(path) {
        path.remove();
      },
      TSTypeAliasDeclaration(path) {
        path.remove();
      },
      TSEnumDeclaration(path) {
        transformEnum(path, babelCore.types);
      },
      TSImportEqualsDeclaration(path) {
        throw path.buildCodeFrameError("`import =` is not supported; use `import <module> from '<module>';` and enable `--allowSyntheticDefaultImports`.");
      },
      TSExportAssignment(path) {
        throw path.buildCodeFrameError("`export =` is not supported; use `export <value>;`.");
      },
      TSTypeAssertion(path) {
        path.replaceWith(path.node.expression);
      },
      TSAsExpression(path) {
        let { node } = path;
        while (babelCore.types.isTSAsExpression(node)) {
          node = node.expression;
        }
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
});

module.exports = transformTypescript;
