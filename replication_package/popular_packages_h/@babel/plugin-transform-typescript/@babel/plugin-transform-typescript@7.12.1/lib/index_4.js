"use strict";

const { declare } = require("@babel/helper-plugin-utils");
const syntaxTypeScript = require("@babel/plugin-syntax-typescript").default;
const { types, template } = require("@babel/core");
const createClassFeaturesPlugin = require("@babel/helper-create-class-features-plugin");
const transformEnums = require("./enum").default;
const transformNamespace = require("./namespace").default;

const isValidTypeReference = path => {
  const parentType = path.parent.type;
  if (["TSTypeReference", "TSQualifiedName", "TSExpressionWithTypeArguments", "TSTypeQuery"].includes(parentType)) {
    return true;
  }
  if (parentType === "ExportSpecifier") {
    return path.parentPath.parent.exportKind === "type";
  }
  return false;
};

const removeTypeModifiers = (node) => {
  ["accessibility", "abstract", "readonly", "optional", "typeAnnotation", "definite", "declare"].forEach(mod => {
    if (node[mod]) node[mod] = null;
  });
};

const globalTypes = new WeakMap();
const parsedParams = new WeakSet();

const isGlobalType = (path, name) => {
  const programNode = path.find(path => path.isProgram()).node;
  if (path.scope.hasOwnBinding(name)) return false;

  const typeSet = globalTypes.get(programNode);
  if (typeSet && typeSet.has(name)) return true;

  console.warn(`Unresolved identifier "${name}" is treated as a JavaScript value. Potential misconfiguration in scope tracking.`);
  return false;
};

const registerGlobalType = (scope, name) => {
  const typeSet = globalTypes.get(scope.path.node);
  if (typeSet) typeSet.add(name);
};

const processClassMembers = {
  field(path, { allowDeclareFields }) {
    const { node } = path;
    if (!allowDeclareFields && node.declare) throw path.buildCodeFrameError(`Declare fields require 'allowDeclareFields' enabled.`);
    if (node.declare && !node.value && !node.decorators) path.remove();
    else if (node.definite && node.value) throw path.buildCodeFrameError(`Definite assignments cannot be initialized here.`);
    else removeTypeModifiers(node);
  },

  constructor(path, classPath) {
    const params = [];
    path.node.params.forEach(param => {
      if (param.type === "TSParameterProperty" && !parsedParams.has(param.parameter)) {
        parsedParams.add(param.parameter);
        params.push(param.parameter);
      }
    });
    if (params.length) {
      const assigns = params.map(p => {
        const id = types.isIdentifier(p) ? p : p.left;
        return template.statement.ast`this.${types.cloneNode(id)} = ${types.cloneNode(id)}`;
      });
      createClassFeaturesPlugin.injectInitialization(classPath, path, assigns);
    }
  }
};

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const JSX_PRAGMA_REGEX = /\*?\s*@jsx((?:Frag)?)\s+([^\s]+)/;
  const { jsxPragma = "React.createElement", jsxPragmaFrag = "React.Fragment", allowNamespaces = false, allowDeclareFields = false, onlyRemoveTypeImports = false } = options;

  return {
    name: "transform-typescript",
    inherits: syntaxTypeScript,
    visitor: {
      Program(path, state) {
        const { file } = state;
        let pragmaImportName = jsxPragma.split(".")[0];
        let pragmaFragImportName = jsxPragmaFrag.split(".")[0];

        if (!globalTypes.has(path.node)) globalTypes.set(path.node, new Set());

        if (file.ast.comments) {
          file.ast.comments.forEach(comment => {
            const matches = JSX_PRAGMA_REGEX.exec(comment.value);
            if (matches) {
              if (matches[1]) pragmaFragImportName = matches[2];
              else pragmaImportName = matches[2];
            }
          });
        }

        for (const stmt of path.get("body")) {
          if (types.isImportDeclaration(stmt)) {
            if (stmt.node.importKind === "type") {
              stmt.remove();
              continue;
            }
            if (!onlyRemoveTypeImports && stmt.node.specifiers.length > 0 && stmt.node.specifiers.every(s => {
              const binding = stmt.scope.getBinding(s.local.name);
              return binding && isValidTypeReference(binding.path);
            })) {
              stmt.remove();
            }
            continue;
          }

          if (stmt.isExportDeclaration()) stmt = stmt.get("declaration");
          if (stmt.isVariableDeclaration({ declare: true }) || stmt.isTSTypeAliasDeclaration() || stmt.isTSDeclareFunction() || stmt.isTSInterfaceDeclaration() || stmt.isClassDeclaration({ declare: true }) || stmt.isTSEnumDeclaration({ declare: true }) || stmt.isTSModuleDeclaration({ declare: true }) && stmt.get("id").isIdentifier()) {
            registerGlobalType(path.scope, stmt.node.id.name);
          }
        }
      },

      ExportNamedDeclaration(path) {
        if (path.node.exportKind === "type") path.remove();
        else if (path.node.specifiers.every(spec => isGlobalType(path, spec.local.name))) path.remove();
      },

      ExportSpecifier(path) {
        if (!path.parent.source && isGlobalType(path, path.node.local.name)) path.remove();
      },

      ExportDefaultDeclaration(path) {
        if (types.isIdentifier(path.node.declaration) && isGlobalType(path, path.node.declaration.name)) path.remove();
      },

      ClassDeclaration(path) {
        if (path.node.declare) path.remove();
      },

      Class(path) {
        removeTypeModifiers(path.node);
        path.get("body.body").forEach(child => {
          if (child.isClassMethod() || child.isClassPrivateMethod()) {
            if (child.node.kind === "constructor") processClassMembers.constructor(child, path);
            else processClassMembers.method(child, path);
          } else if (child.isClassProperty() || child.isClassPrivateProperty()) {
            processClassMembers.field(child, { allowDeclareFields });
          }
        });
      },

      Function(path) {
        removeTypeModifiers(path.node);
        if (path.node.params[0]?.name === "this") path.node.params.shift();
        path.node.params = path.node.params.map(param => param.type === "TSParameterProperty" ? param.parameter : param);
      },

      TSModuleDeclaration(path) {
        transformNamespace(path, types, allowNamespaces);
      },

      TSTypeAliasDeclaration: path => path.remove(),
      TSInterfaceDeclaration: path => path.remove(),
      TSDeclareFunction: path => path.remove(),
      TSDeclareMethod: path => path.remove(),
      VariableDeclaration: path => path.remove(),
      VariableDeclarator(path) { if (path.node.definite) path.node.definite = null; },
      TSIndexSignature: path => path.remove(),
      TSEnumDeclaration(path) { transformEnums(path, types); },
      TSImportEqualsDeclaration(path) { throw path.buildCodeFrameError("`import =` is not supported in Babel. Consider using `import` and configuring TypeScript."); },
      TSExportAssignment(path) { throw path.buildCodeFrameError("`export =` is not supported in Babel. Consider using `export`."); },

      TSTypeAssertion(path) { path.replaceWith(path.node.expression); },
      TSAsExpression(path) { let node = path.node; do { node = node.expression; } while (types.isTSAsExpression(node)); path.replaceWith(node); },
      TSNonNullExpression(path) { path.replaceWith(path.node.expression); },

      CallExpression(path) { path.node.typeParameters = null; },
      OptionalCallExpression(path) { path.node.typeParameters = null; },
      NewExpression(path) { path.node.typeParameters = null; },
      JSXOpeningElement(path) { path.node.typeParameters = null; },
      TaggedTemplateExpression(path) { path.node.typeParameters = null; }
    }
  }
});
