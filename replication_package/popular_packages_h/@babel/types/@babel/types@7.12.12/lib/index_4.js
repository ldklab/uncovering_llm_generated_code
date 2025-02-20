"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const exportedModules = [
  "react",
  "assertNode",
  "createTypeAnnotationBasedOnTypeof",
  "createUnionTypeAnnotation",
  "createFlowUnionType",
  "createTSUnionType",
  "cloneNode",
  "clone",
  "cloneDeep",
  "cloneDeepWithoutLoc",
  "cloneWithoutLoc",
  "addComment",
  "addComments",
  "inheritInnerComments",
  "inheritLeadingComments",
  "inheritsComments",
  "inheritTrailingComments",
  "removeComments",
  "ensureBlock",
  "toBindingIdentifierName",
  "toBlock",
  "toComputedKey",
  "toExpression",
  "toIdentifier",
  "toKeyAlias",
  "toSequenceExpression",
  "toStatement",
  "valueToNode",
  "appendToMemberExpression",
  "inherits",
  "prependToMemberExpression",
  "removeProperties",
  "removePropertiesDeep",
  "removeTypeDuplicates",
  "getBindingIdentifiers",
  "getOuterBindingIdentifiers",
  "traverse",
  "traverseFast",
  "shallowEqual",
  "is",
  "isBinding",
  "isBlockScoped",
  "isImmutable",
  "isLet",
  "isNode",
  "isNodesEquivalent",
  "isPlaceholderType",
  "isReferenced",
  "isScope",
  "isSpecifierDefault",
  "isType",
  "isValidES3Identifier",
  "isValidIdentifier",
  "isVar",
  "matchesPattern",
  "validate",
  "buildMatchMemberExpression"
];

const modulesFromPaths = {
  react: './validators/react/isReactComponent',
  isCompatTag: './validators/react/isCompatTag',
  buildChildren: './builders/react/buildChildren',
  assertNode: './asserts/assertNode',
  createTypeAnnotationBasedOnTypeof: './builders/flow/createTypeAnnotationBasedOnTypeof',
  createFlowUnionType: './builders/flow/createFlowUnionType',
  createTSUnionType: './builders/typescript/createTSUnionType',
  cloneNode: './clone/cloneNode',
  clone: './clone/clone',
  cloneDeep: './clone/cloneDeep',
  cloneDeepWithoutLoc: './clone/cloneDeepWithoutLoc',
  cloneWithoutLoc: './clone/cloneWithoutLoc',
  addComment: './comments/addComment',
  addComments: './comments/addComments',
  inheritInnerComments: './comments/inheritInnerComments',
  inheritLeadingComments: './comments/inheritLeadingComments',
  inheritsComments: './comments/inheritsComments',
  inheritTrailingComments: './comments/inheritTrailingComments',
  removeComments: './comments/removeComments',
  ensureBlock: './converters/ensureBlock',
  toBindingIdentifierName: './converters/toBindingIdentifierName',
  toBlock: './converters/toBlock',
  toComputedKey: './converters/toComputedKey',
  toExpression: './converters/toExpression',
  toIdentifier: './converters/toIdentifier',
  toKeyAlias: './converters/toKeyAlias',
  toSequenceExpression: './converters/toSequenceExpression',
  toStatement: './converters/toStatement',
  valueToNode: './converters/valueToNode',
  appendToMemberExpression: './modifications/appendToMemberExpression',
  inherits: './modifications/inherits',
  prependToMemberExpression: './modifications/prependToMemberExpression',
  removeProperties: './modifications/removeProperties',
  removePropertiesDeep: './modifications/removePropertiesDeep',
  removeTypeDuplicates: './modifications/flow/removeTypeDuplicates',
  getBindingIdentifiers: './retrievers/getBindingIdentifiers',
  getOuterBindingIdentifiers: './retrievers/getOuterBindingIdentifiers',
  traverse: './traverse/traverse',
  traverseFast: './traverse/traverseFast',
  shallowEqual: './utils/shallowEqual',
  is: './validators/is',
  isBinding: './validators/isBinding',
  isBlockScoped: './validators/isBlockScoped',
  isImmutable: './validators/isImmutable',
  isLet: './validators/isLet',
  isNode: './validators/isNode',
  isNodesEquivalent: './validators/isNodesEquivalent',
  isPlaceholderType: './validators/isPlaceholderType',
  isReferenced: './validators/isReferenced',
  isScope: './validators/isScope',
  isSpecifierDefault: './validators/isSpecifierDefault',
  isType: './validators/isType',
  isValidES3Identifier: './validators/isValidES3Identifier',
  isValidIdentifier: './validators/isValidIdentifier',
  isVar: './validators/isVar',
  matchesPattern: './validators/matchesPattern',
  validate: './validators/validate',
  buildMatchMemberExpression: './validators/buildMatchMemberExpression'
};

const _exportNames = [...exportedModules];
_exportNames.forEach(exportName => {
  Object.defineProperty(exports, exportName, {
    enumerable: true,
    get: function() {
      const path = modulesFromPaths[exportName];
      return require(path).default;
    }
  });
});

const react = {
  isReactComponent: require('./validators/react/isReactComponent').default,
  isCompatTag: require('./validators/react/isCompatTag').default,
  buildChildren: require('./builders/react/buildChildren').default
};
exports.react = react;

// Import additional non-default keys from other modules
const importAndExportKeysFromModules = (importPath) => {
  const importedModule = require(importPath);
  Object.keys(importedModule).forEach(key => {
    if (!["default", "__esModule"].includes(key) && !Object.prototype.hasOwnProperty.call(_exportNames, key) && !(key in exports && exports[key] === importedModule[key])) {
      Object.defineProperty(exports, key, {
        enumerable: true,
        get: function() {
          return importedModule[key];
        }
      });
    }
  });
};

[
  './asserts/generated',
  './builders/generated',
  './builders/generated/uppercase',
  './constants/generated',
  './constants',
  './definitions',
  './traverse/traverse',
  './validators/generated',
  './ast-types/generated'
].forEach(importAndExportKeysFromModules);
