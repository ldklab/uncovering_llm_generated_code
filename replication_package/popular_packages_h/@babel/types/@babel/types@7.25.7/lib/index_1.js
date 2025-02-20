"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const modules = {
  _deprecationWarning: require("./utils/deprecationWarning.js"),
  _addComment: require("./comments/addComment.js"),
  _addComments: require("./comments/addComments.js"),
  _appendToMemberExpression: require("./modifications/appendToMemberExpression.js"),
  _assertNode: require("./asserts/assertNode.js"),
  _buildMatchMemberExpression: require("./validators/buildMatchMemberExpression.js"),
  _clone: require("./clone/clone.js"),
  _cloneDeep: require("./clone/cloneDeep.js"),
  _cloneDeepWithoutLoc: require("./clone/cloneDeepWithoutLoc.js"),
  _cloneNode: require("./clone/cloneNode.js"),
  _cloneWithoutLoc: require("./clone/cloneWithoutLoc.js"),
  _createFlowUnionType: require("./builders/flow/createFlowUnionType.js"),
  _createTSUnionType: require("./builders/typescript/createTSUnionType.js"),
  _createTypeAnnotationBasedOnTypeof: require("./builders/flow/createTypeAnnotationBasedOnTypeof.js"),
  _ensureBlock: require("./converters/ensureBlock.js"),
  _getAssignmentIdentifiers: require("./retrievers/getAssignmentIdentifiers.js"),
  _getBindingIdentifiers: require("./retrievers/getBindingIdentifiers.js"),
  _getFunctionName: require("./retrievers/getFunctionName.js"),
  _getOuterBindingIdentifiers: require("./retrievers/getOuterBindingIdentifiers.js"),
  _inheritInnerComments: require("./comments/inheritInnerComments.js"),
  _inheritLeadingComments: require("./comments/inheritLeadingComments.js"),
  _inheritTrailingComments: require("./comments/inheritTrailingComments.js"),
  _inherits: require("./modifications/inherits.js"),
  _inheritsComments: require("./comments/inheritsComments.js"),
  _is: require("./validators/is.js"),
  _isBinding: require("./validators/isBinding.js"),
  _isBlockScoped: require("./validators/isBlockScoped.js"),
  _isImmutable: require("./validators/isImmutable.js"),
  _isLet: require("./validators/isLet.js"),
  _isNode: require("./validators/isNode.js"),
  _isNodesEquivalent: require("./validators/isNodesEquivalent.js"),
  _isPlaceholderType: require("./validators/isPlaceholderType.js"),
  _isReferenced: require("./validators/isReferenced.js"),
  _isScope: require("./validators/isScope.js"),
  _isSpecifierDefault: require("./validators/isSpecifierDefault.js"),
  _isType: require("./validators/isType.js"),
  _isValidES3Identifier: require("./validators/isValidES3Identifier.js"),
  _isValidIdentifier: require("./validators/isValidIdentifier.js"),
  _isVar: require("./validators/isVar.js"),
  _matchesPattern: require("./validators/matchesPattern.js"),
  _prependToMemberExpression: require("./modifications/prependToMemberExpression.js"),
  _removeComments: require("./comments/removeComments.js"),
  _removeProperties: require("./modifications/removeProperties.js"),
  _removePropertiesDeep: require("./modifications/removePropertiesDeep.js"),
  _removeTypeDuplicates: require("./modifications/flow/removeTypeDuplicates.js"),
  _shallowEqual: require("./utils/shallowEqual.js"),
  _toBindingIdentifierName: require("./converters/toBindingIdentifierName.js"),
  _toBlock: require("./converters/toBlock.js"),
  _toComputedKey: require("./converters/toComputedKey.js"),
  _toExpression: require("./converters/toExpression.js"),
  _toIdentifier: require("./converters/toIdentifier.js"),
  _toKeyAlias: require("./converters/toKeyAlias.js"),
  _toStatement: require("./converters/toStatement.js"),
  _traverse: require("./traverse/traverse.js"),
  _traverseFast: require("./traverse/traverseFast.js"),
  _validate: require("./validators/validate.js"),
  _valueToNode: require("./converters/valueToNode.js"),
  _isReactComponent: require("./validators/react/isReactComponent.js"),
  _isCompatTag: require("./validators/react/isCompatTag.js"),
  _buildChildren: require("./builders/react/buildChildren.js"),
};

const exportNames = {
  react: modules._isReactComponent,
  assertNode: modules._assertNode,
  createTypeAnnotationBasedOnTypeof: modules._createTypeAnnotationBasedOnTypeof,
  createUnionTypeAnnotation: modules._createFlowUnionType,
  createFlowUnionType: modules._createFlowUnionType,
  createTSUnionType: modules._createTSUnionType,
  cloneNode: modules._cloneNode,
  clone: modules._clone,
  cloneDeep: modules._cloneDeep,
  cloneDeepWithoutLoc: modules._cloneDeepWithoutLoc,
  cloneWithoutLoc: modules._cloneWithoutLoc,
  addComment: modules._addComment,
  addComments: modules._addComments,
  inheritInnerComments: modules._inheritInnerComments,
  inheritLeadingComments: modules._inheritLeadingComments,
  inheritsComments: modules._inheritsComments,
  inheritTrailingComments: modules._inheritTrailingComments,
  removeComments: modules._removeComments,
  ensureBlock: modules._ensureBlock,
  toBindingIdentifierName: modules._toBindingIdentifierName,
  toBlock: modules._toBlock,
  toComputedKey: modules._toComputedKey,
  toExpression: modules._toExpression,
  toIdentifier: modules._toIdentifier,
  toKeyAlias: modules._toKeyAlias,
  toStatement: modules._toStatement,
  valueToNode: modules._valueToNode,
  appendToMemberExpression: modules._appendToMemberExpression,
  inherits: modules._inherits,
  prependToMemberExpression: modules._prependToMemberExpression,
  removeProperties: modules._removeProperties,
  removePropertiesDeep: modules._removePropertiesDeep,
  removeTypeDuplicates: modules._removeTypeDuplicates,
  getAssignmentIdentifiers: modules._getAssignmentIdentifiers,
  getBindingIdentifiers: modules._getBindingIdentifiers,
  getOuterBindingIdentifiers: modules._getOuterBindingIdentifiers,
  getFunctionName: modules._getFunctionName,
  traverse: modules._traverse,
  traverseFast: modules._traverseFast,
  shallowEqual: modules._shallowEqual,
  is: modules._is,
  isBinding: modules._isBinding,
  isBlockScoped: modules._isBlockScoped,
  isImmutable: modules._isImmutable,
  isLet: modules._isLet,
  isNode: modules._isNode,
  isNodesEquivalent: modules._isNodesEquivalent,
  isPlaceholderType: modules._isPlaceholderType,
  isReferenced: modules._isReferenced,
  isScope: modules._isScope,
  isSpecifierDefault: modules._isSpecifierDefault,
  isType: modules._isType,
  isValidES3Identifier: modules._isValidES3Identifier,
  isValidIdentifier: modules._isValidIdentifier,
  isVar: modules._isVar,
  matchesPattern: modules._matchesPattern,
  validate: modules._validate,
  buildMatchMemberExpression: modules._buildMatchMemberExpression,
  __internal__deprecationWarning: modules._deprecationWarning,
};

Object.keys(exportNames).forEach((key) => {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: () => exportNames[key].default,
  });
});

exports.react = {
  isReactComponent: modules._isReactComponent.default,
  isCompatTag: modules._isCompatTag.default,
  buildChildren: modules._buildChildren.default,
};

if (process.env.BABEL_TYPES_8_BREAKING) {
  console.warn(
    "BABEL_TYPES_8_BREAKING is not supported anymore. Use the latest Babel 8.0.0 pre-release instead!"
  );
}

//# sourceMappingURL=index.js.map
