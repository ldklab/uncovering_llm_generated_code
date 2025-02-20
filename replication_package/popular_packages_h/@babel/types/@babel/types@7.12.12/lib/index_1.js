"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const _exportNames = {
  react: true,
  assertNode: true,
  createTypeAnnotationBasedOnTypeof: true,
  createUnionTypeAnnotation: true,
  createFlowUnionType: true,
  createTSUnionType: true,
  cloneNode: true,
  clone: true,
  cloneDeep: true,
  cloneDeepWithoutLoc: true,
  cloneWithoutLoc: true,
  addComment: true,
  addComments: true,
  inheritInnerComments: true,
  inheritLeadingComments: true,
  inheritsComments: true,
  inheritTrailingComments: true,
  removeComments: true,
  ensureBlock: true,
  toBindingIdentifierName: true,
  toBlock: true,
  toComputedKey: true,
  toExpression: true,
  toIdentifier: true,
  toKeyAlias: true,
  toSequenceExpression: true,
  toStatement: true,
  valueToNode: true,
  appendToMemberExpression: true,
  inherits: true,
  prependToMemberExpression: true,
  removeProperties: true,
  removePropertiesDeep: true,
  removeTypeDuplicates: true,
  getBindingIdentifiers: true,
  getOuterBindingIdentifiers: true,
  traverse: true,
  traverseFast: true,
  shallowEqual: true,
  is: true,
  isBinding: true,
  isBlockScoped: true,
  isImmutable: true,
  isLet: true,
  isNode: true,
  isNodesEquivalent: true,
  isPlaceholderType: true,
  isReferenced: true,
  isScope: true,
  isSpecifierDefault: true,
  isType: true,
  isValidES3Identifier: true,
  isValidIdentifier: true,
  isVar: true,
  matchesPattern: true,
  validate: true,
  buildMatchMemberExpression: true,
};

const importedModules = [
  { name: "assertNode", path: "./asserts/assertNode" },
  { name: "createTypeAnnotationBasedOnTypeof", path: "./builders/flow/createTypeAnnotationBasedOnTypeof" },
  { name: "createUnionTypeAnnotation", path: "./builders/flow/createFlowUnionType" },
  { name: "createFlowUnionType", path: "./builders/flow/createFlowUnionType" },
  { name: "createTSUnionType", path: "./builders/typescript/createTSUnionType" },
  { name: "cloneNode", path: "./clone/cloneNode" },
  { name: "clone", path: "./clone/clone" },
  { name: "cloneDeep", path: "./clone/cloneDeep" },
  { name: "cloneDeepWithoutLoc", path: "./clone/cloneDeepWithoutLoc" },
  { name: "cloneWithoutLoc", path: "./clone/cloneWithoutLoc" },
  { name: "addComment", path: "./comments/addComment" },
  { name: "addComments", path: "./comments/addComments" },
  { name: "inheritInnerComments", path: "./comments/inheritInnerComments" },
  { name: "inheritLeadingComments", path: "./comments/inheritLeadingComments" },
  { name: "inheritsComments", path: "./comments/inheritsComments" },
  { name: "inheritTrailingComments", path: "./comments/inheritTrailingComments" },
  { name: "removeComments", path: "./comments/removeComments" },
  { name: "ensureBlock", path: "./converters/ensureBlock" },
  { name: "toBindingIdentifierName", path: "./converters/toBindingIdentifierName" },
  { name: "toBlock", path: "./converters/toBlock" },
  { name: "toComputedKey", path: "./converters/toComputedKey" },
  { name: "toExpression", path: "./converters/toExpression" },
  { name: "toIdentifier", path: "./converters/toIdentifier" },
  { name: "toKeyAlias", path: "./converters/toKeyAlias" },
  { name: "toSequenceExpression", path: "./converters/toSequenceExpression" },
  { name: "toStatement", path: "./converters/toStatement" },
  { name: "valueToNode", path: "./converters/valueToNode" },
  { name: "appendToMemberExpression", path: "./modifications/appendToMemberExpression" },
  { name: "inherits", path: "./modifications/inherits" },
  { name: "prependToMemberExpression", path: "./modifications/prependToMemberExpression" },
  { name: "removeProperties", path: "./modifications/removeProperties" },
  { name: "removePropertiesDeep", path: "./modifications/removePropertiesDeep" },
  { name: "removeTypeDuplicates", path: "./modifications/flow/removeTypeDuplicates" },
  { name: "getBindingIdentifiers", path: "./retrievers/getBindingIdentifiers" },
  { name: "getOuterBindingIdentifiers", path: "./retrievers/getOuterBindingIdentifiers" },
  { name: "traverse", path: "./traverse/traverse" },
  { name: "traverseFast", path: "./traverse/traverseFast" },
  { name: "shallowEqual", path: "./utils/shallowEqual" },
  { name: "is", path: "./validators/is" },
  { name: "isBinding", path: "./validators/isBinding" },
  { name: "isBlockScoped", path: "./validators/isBlockScoped" },
  { name: "isImmutable", path: "./validators/isImmutable" },
  { name: "isLet", path: "./validators/isLet" },
  { name: "isNode", path: "./validators/isNode" },
  { name: "isNodesEquivalent", path: "./validators/isNodesEquivalent" },
  { name: "isPlaceholderType", path: "./validators/isPlaceholderType" },
  { name: "isReferenced", path: "./validators/isReferenced" },
  { name: "isScope", path: "./validators/isScope" },
  { name: "isSpecifierDefault", path: "./validators/isSpecifierDefault" },
  { name: "isType", path: "./validators/isType" },
  { name: "isValidES3Identifier", path: "./validators/isValidES3Identifier" },
  { name: "isValidIdentifier", path: "./validators/isValidIdentifier" },
  { name: "isVar", path: "./validators/isVar" },
  { name: "matchesPattern", path: "./validators/matchesPattern" },
  { name: "validate", path: "./validators/validate" },
  { name: "buildMatchMemberExpression", path: "./validators/buildMatchMemberExpression" }
];

importedModules.forEach(({ name, path }) => {
  Object.defineProperty(exports, name, {
    enumerable: true,
    get: function () {
      return require(path).default;
    }
  });
});

const react = {
  isReactComponent: require("./validators/react/isReactComponent").default,
  isCompatTag: require("./validators/react/isCompatTag").default,
  buildChildren: require("./builders/react/buildChildren").default
};

exports.react = react;

const _interopRequireWildcard = (obj) => {
  if (obj && obj.__esModule) return obj;
  const newObj = {};
  if (null != obj) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  return newObj;
};

const _interopRequireDefault = (obj) => obj && obj.__esModule ? obj : { default: obj };

const modulesWithKeys = [
  "./asserts/generated",
  "./builders/generated",
  "./builders/generated/uppercase",
  "./constants/generated",
  "./constants",
  "./definitions",
  "./traverse/traverse",
  "./validators/generated",
  "./ast-types/generated"
];

modulesWithKeys.forEach(modulePath => {
  const moduleObj = require(modulePath);
  Object.keys(moduleObj).forEach(key => {
    if (!_exportNames[key]) {
      Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
          return moduleObj[key];
        }
      });
    }
  });
});
