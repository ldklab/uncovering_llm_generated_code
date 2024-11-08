"use strict";

// Emitting the exported names to prevent duplicate exports
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
  toStatement: true,
  valueToNode: true,
  appendToMemberExpression: true,
  inherits: true,
  prependToMemberExpression: true,
  removeProperties: true,
  removePropertiesDeep: true,
  removeTypeDuplicates: true,
  getAssignmentIdentifiers: true,
  getBindingIdentifiers: true,
  getOuterBindingIdentifiers: true,
  getFunctionName: true,
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
  __internal__deprecationWarning: true
};

// React specific functionalities
const react = {
  isReactComponent: require("./validators/react/isReactComponent.js").default,
  isCompatTag: require("./validators/react/isCompatTag.js").default,
  buildChildren: require("./builders/react/buildChildren.js").default
};

// Import various modules and map them to exports using Object.defineProperty for lazy evaluation
const modules = {
  _deprecationWarning: "./utils/deprecationWarning.js",
  _addComment: "./comments/addComment.js",
  _addComments: "./comments/addComments.js",
  _appendToMemberExpression: "./modifications/appendToMemberExpression.js",
  _assertNode: "./asserts/assertNode.js",
  _buildMatchMemberExpression: "./validators/buildMatchMemberExpression.js",
  _clone: "./clone/clone.js",
  _cloneDeep: "./clone/cloneDeep.js",
  _cloneDeepWithoutLoc: "./clone/cloneDeepWithoutLoc.js",
  _cloneNode: "./clone/cloneNode.js",
  _cloneWithoutLoc: "./clone/cloneWithoutLoc.js",
  _createFlowUnionType: "./builders/flow/createFlowUnionType.js",
  _createTSUnionType: "./builders/typescript/createTSUnionType.js",
  _createTypeAnnotationBasedOnTypeof: "./builders/flow/createTypeAnnotationBasedOnTypeof.js",
  _ensureBlock: "./converters/ensureBlock.js",
  _getAssignmentIdentifiers: "./retrievers/getAssignmentIdentifiers.js",
  _getBindingIdentifiers: "./retrievers/getBindingIdentifiers.js",
  _getFunctionName: "./retrievers/getFunctionName.js",
  _getOuterBindingIdentifiers: "./retrievers/getOuterBindingIdentifiers.js",
  _inheritInnerComments: "./comments/inheritInnerComments.js",
  _inheritLeadingComments: "./comments/inheritLeadingComments.js",
  _inheritTrailingComments: "./comments/inheritTrailingComments.js",
  _inheritsComments: "./comments/inheritsComments.js",
  _is: "./validators/is.js",
  _isBinding: "./validators/isBinding.js",
  _isBlockScoped: "./validators/isBlockScoped.js",
  _isImmutable: "./validators/isImmutable.js",
  _isLet: "./validators/isLet.js",
  _isNode: "./validators/isNode.js",
  _isNodesEquivalent: "./validators/isNodesEquivalent.js",
  _isPlaceholderType: "./validators/isPlaceholderType.js",
  _isReferenced: "./validators/isReferenced.js",
  _isScope: "./validators/isScope.js",
  _isSpecifierDefault: "./validators/isSpecifierDefault.js",
  _isType: "./validators/isType.js",
  _isValidES3Identifier: "./validators/isValidES3Identifier.js",
  _isValidIdentifier: "./validators/isValidIdentifier.js",
  _isVar: "./validators/isVar.js",
  _matchesPattern: "./validators/matchesPattern.js",
  _prependToMemberExpression: "./modifications/prependToMemberExpression.js",
  _removeComments: "./comments/removeComments.js",
  _removeProperties: "./modifications/removeProperties.js",
  _removePropertiesDeep: "./modifications/removePropertiesDeep.js",
  _removeTypeDuplicates: "./modifications/flow/removeTypeDuplicates.js",
  _shallowEqual: "./utils/shallowEqual.js",
  _toBindingIdentifierName: "./converters/toBindingIdentifierName.js",
  _toBlock: "./converters/toBlock.js",
  _toComputedKey: "./converters/toComputedKey.js",
  _toExpression: "./converters/toExpression.js",
  _toIdentifier: "./converters/toIdentifier.js",
  _toKeyAlias: "./converters/toKeyAlias.js",
  _toStatement: "./converters/toStatement.js",
  _traverse: "./traverse/traverse.js",
  _traverseFast: "./traverse/traverseFast.js",
  _validate: "./validators/validate.js",
  _valueToNode: "./converters/valueToNode.js",
};

// Manually create property definitions for each module so that they're lazily loaded
Object.keys(modules).forEach(mod => {
  Object.defineProperty(exports, mod.replace(/^_/, ""), {
    enumerable: true,
    get: () => require(modules[mod]).default
  });
});

exports.react = react;

// Automatically export everything else from any imports that aren't in the _exportNames
const handleDynamicExports = (path, overwrite = false) => {
  const importedModule = require(path);
  Object.keys(importedModule).forEach(key => {
    if (key === "default" || key === "__esModule") return;
    if (!overwrite && Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (exports[key] === importedModule[key]) return;

    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => importedModule[key]
    });
  });
};

// Handle dynamic exports from various indices
handleDynamicExports("./asserts/generated/index.js");
handleDynamicExports("./builders/generated/index.js");
handleDynamicExports("./builders/generated/uppercase.js");
handleDynamicExports("./builders/productions.js");
handleDynamicExports("./constants/generated/index.js");
handleDynamicExports("./constants/index.js");
handleDynamicExports("./definitions/index.js");
handleDynamicExports("./traverse/traverse.js", true);
handleDynamicExports("./validators/generated/index.js");

// Environment-specific logic
if (process.env.BABEL_TYPES_8_BREAKING) {
  console.warn("BABEL_TYPES_8_BREAKING is not supported anymore. Use the latest Babel 8.0.0 pre-release instead!");
}

// Export additional converters conditionally
exports.toSequenceExpression = require("./converters/toSequenceExpression.js").default;

//# sourceMappingURL=index.js.map
