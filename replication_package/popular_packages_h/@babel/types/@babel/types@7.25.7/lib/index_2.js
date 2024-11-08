"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

// Import various modules and set up exported properties
import _isReactComponent from "./validators/react/isReactComponent.js";
import _isCompatTag from "./validators/react/isCompatTag.js";
import _buildChildren from "./builders/react/buildChildren.js";
import _assertNode from "./asserts/assertNode.js";
import * as _index from "./asserts/generated/index.js";
import _createTypeAnnotationBasedOnTypeof from "./builders/flow/createTypeAnnotationBasedOnTypeof.js";
import _createFlowUnionType from "./builders/flow/createFlowUnionType.js";
import _createTSUnionType from "./builders/typescript/createTSUnionType.js";
import * as _index2 from "./builders/generated/index.js";
import * as _uppercase from "./builders/generated/uppercase.js";
import * as _productions from "./builders/productions.js";
import _cloneNode from "./clone/cloneNode.js";
import _clone from "./clone/clone.js";
import _cloneDeep from "./clone/cloneDeep.js";
import _cloneDeepWithoutLoc from "./clone/cloneDeepWithoutLoc.js";
import _cloneWithoutLoc from "./clone/cloneWithoutLoc.js";
import _addComment from "./comments/addComment.js";
import _addComments from "./comments/addComments.js";
import _inheritInnerComments from "./comments/inheritInnerComments.js";
import _inheritLeadingComments from "./comments/inheritLeadingComments.js";
import _inheritsComments from "./comments/inheritsComments.js";
import _inheritTrailingComments from "./comments/inheritTrailingComments.js";
import _removeComments from "./comments/removeComments.js";
import * as _index3 from "./constants/generated/index.js";
import * as _index4 from "./constants/index.js";
import _ensureBlock from "./converters/ensureBlock.js";
import _toBindingIdentifierName from "./converters/toBindingIdentifierName.js";
import _toBlock from "./converters/toBlock.js";
import _toComputedKey from "./converters/toComputedKey.js";
import _toExpression from "./converters/toExpression.js";
import _toIdentifier from "./converters/toIdentifier.js";
import _toKeyAlias from "./converters/toKeyAlias.js";
import _toStatement from "./converters/toStatement.js";
import _valueToNode from "./converters/valueToNode.js";
import * as _index5 from "./definitions/index.js";
import _appendToMemberExpression from "./modifications/appendToMemberExpression.js";
import _inherits from "./modifications/inherits.js";
import _prependToMemberExpression from "./modifications/prependToMemberExpression.js";
import _removeProperties from "./modifications/removeProperties.js";
import _removePropertiesDeep from "./modifications/removePropertiesDeep.js";
import _removeTypeDuplicates from "./modifications/flow/removeTypeDuplicates.js";
import _getAssignmentIdentifiers from "./retrievers/getAssignmentIdentifiers.js";
import _getBindingIdentifiers from "./retrievers/getBindingIdentifiers.js";
import _getOuterBindingIdentifiers from "./retrievers/getOuterBindingIdentifiers.js";
import _getFunctionName from "./retrievers/getFunctionName.js";
import * as _traverse from "./traverse/traverse.js";
import _traverseFast from "./traverse/traverseFast.js";
import _shallowEqual from "./utils/shallowEqual.js";
import _is from "./validators/is.js";
import _isBinding from "./validators/isBinding.js";
import _isBlockScoped from "./validators/isBlockScoped.js";
import _isImmutable from "./validators/isImmutable.js";
import _isLet from "./validators/isLet.js";
import _isNode from "./validators/isNode.js";
import _isNodesEquivalent from "./validators/isNodesEquivalent.js";
import _isPlaceholderType from "./validators/isPlaceholderType.js";
import _isReferenced from "./validators/isReferenced.js";
import _isScope from "./validators/isScope.js";
import _isSpecifierDefault from "./validators/isSpecifierDefault.js";
import _isType from "./validators/isType.js";
import _isValidES3Identifier from "./validators/isValidES3Identifier.js";
import _isValidIdentifier from "./validators/isValidIdentifier.js";
import _isVar from "./validators/isVar.js";
import _matchesPattern from "./validators/matchesPattern.js";
import _validate from "./validators/validate.js";
import _buildMatchMemberExpression from "./validators/buildMatchMemberExpression.js";
import * as _index6 from "./validators/generated/index.js";
import _deprecationWarning from "./utils/deprecationWarning.js";

// Export selected modules using Object.defineProperty
const createExportGetter = (name, module, exportNames) => {
  if (!exportNames[name]) {
    Object.defineProperty(exports, name, {
      enumerable: true,
      get: () => module.default
    });
  }
};

createExportGetter("__internal__deprecationWarning", _deprecationWarning, _exportNames);
createExportGetter("addComment", _addComment, _exportNames);
createExportGetter("addComments", _addComments, _exportNames);
createExportGetter("appendToMemberExpression", _appendToMemberExpression, _exportNames);
createExportGetter("assertNode", _assertNode, _exportNames);
createExportGetter("buildMatchMemberExpression", _buildMatchMemberExpression, _exportNames);
createExportGetter("clone", _clone, _exportNames);
createExportGetter("cloneDeep", _cloneDeep, _exportNames);
createExportGetter("cloneDeepWithoutLoc", _cloneDeepWithoutLoc, _exportNames);
createExportGetter("cloneNode", _cloneNode, _exportNames);
createExportGetter("cloneWithoutLoc", _cloneWithoutLoc, _exportNames);
createExportGetter("createFlowUnionType", _createFlowUnionType, _exportNames);
createExportGetter("createTSUnionType", _createTSUnionType, _exportNames);
createExportGetter("createTypeAnnotationBasedOnTypeof", _createTypeAnnotationBasedOnTypeof, _exportNames);
createExportGetter("ensureBlock", _ensureBlock, _exportNames);
createExportGetter("getAssignmentIdentifiers", _getAssignmentIdentifiers, _exportNames);
createExportGetter("getBindingIdentifiers", _getBindingIdentifiers, _exportNames);
createExportGetter("getFunctionName", _getFunctionName, _exportNames);
createExportGetter("getOuterBindingIdentifiers", _getOuterBindingIdentifiers, _exportNames);
createExportGetter("inheritInnerComments", _inheritInnerComments, _exportNames);
createExportGetter("inheritLeadingComments", _inheritLeadingComments, _exportNames);
createExportGetter("inheritTrailingComments", _inheritTrailingComments, _exportNames);
createExportGetter("inherits", _inherits, _exportNames);
createExportGetter("inheritsComments", _inheritsComments, _exportNames);
createExportGetter("is", _is, _exportNames);
createExportGetter("isBinding", _isBinding, _exportNames);
createExportGetter("isBlockScoped", _isBlockScoped, _exportNames);
createExportGetter("isImmutable", _isImmutable, _exportNames);
createExportGetter("isLet", _isLet, _exportNames);
createExportGetter("isNode", _isNode, _exportNames);
createExportGetter("isNodesEquivalent", _isNodesEquivalent, _exportNames);
createExportGetter("isPlaceholderType", _isPlaceholderType, _exportNames);
createExportGetter("isReferenced", _isReferenced, _exportNames);
createExportGetter("isScope", _isScope, _exportNames);
createExportGetter("isSpecifierDefault", _isSpecifierDefault, _exportNames);
createExportGetter("isType", _isType, _exportNames);
createExportGetter("isValidES3Identifier", _isValidES3Identifier, _exportNames);
createExportGetter("isValidIdentifier", _isValidIdentifier, _exportNames);
createExportGetter("isVar", _isVar, _exportNames);
createExportGetter("matchesPattern", _matchesPattern, _exportNames);
createExportGetter("prependToMemberExpression", _prependToMemberExpression, _exportNames);
createExportGetter("removeComments", _removeComments, _exportNames);
createExportGetter("removeProperties", _removeProperties, _exportNames);
createExportGetter("removePropertiesDeep", _removePropertiesDeep, _exportNames);
createExportGetter("removeTypeDuplicates", _removeTypeDuplicates, _exportNames);
createExportGetter("shallowEqual", _shallowEqual, _exportNames);
createExportGetter("toBindingIdentifierName", _toBindingIdentifierName, _exportNames);
createExportGetter("toBlock", _toBlock, _exportNames);
createExportGetter("toComputedKey", _toComputedKey, _exportNames);
createExportGetter("toExpression", _toExpression, _exportNames);
createExportGetter("toIdentifier", _toIdentifier, _exportNames);
createExportGetter("toKeyAlias", _toKeyAlias, _exportNames);
createExportGetter("toStatement", _toStatement, _exportNames);
createExportGetter("traverse", _traverse, _exportNames);
createExportGetter("traverseFast", _traverseFast, _exportNames);
createExportGetter("validate", _validate, _exportNames);
createExportGetter("valueToNode", _valueToNode, _exportNames);

// React specific exports
exports.react = {
  isReactComponent: _isReactComponent,
  isCompatTag: _isCompatTag,
  buildChildren: _buildChildren
};

// Conditional export for `toSequenceExpression` if in specific environment context
{
  exports.toSequenceExpression = require("./converters/toSequenceExpression.js").default;
}

// Logging a warning for deprecated environment variable usage
if (process.env.BABEL_TYPES_8_BREAKING) {
  console.warn("BABEL_TYPES_8_BREAKING is not supported anymore. Use the latest Babel 8.0.0 pre-release instead!");
}
