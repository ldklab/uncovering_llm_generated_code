"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const react = require('./validators/react');
const asserts = require('./asserts');
const buildersFlow = require('./builders/flow');
const buildersTS = require('./builders/typescript');
const buildersGenerated = require('./builders/generated');
const buildersUpperCase = require('./builders/generated/uppercase');
const clone = require('./clone');
const comments = require('./comments');
const constantsGenerated = require('./constants/generated');
const constants = require('./constants');
const converters = require('./converters');
const definitions = require('./definitions');
const modifications = require('./modifications');
const retrievers = require('./retrievers');
const traverseModule = require('./traverse');
const utils = require('./utils');
const validators = require('./validators');
const validatorsGenerated = require('./validators/generated');
const astTypesGenerated = require('./ast-types/generated');

let _exportNames = {
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
  buildMatchMemberExpression: true
};

// Export node-related functions
Object.defineProperty(exports, "assertNode", {
  enumerable: true,
  get: () => asserts.assertNode.default
});

Object.defineProperty(exports, "createTypeAnnotationBasedOnTypeof", {
  enumerable: true,
  get: () => buildersFlow.createTypeAnnotationBasedOnTypeof.default
});

Object.defineProperty(exports, "createUnionTypeAnnotation", {
  enumerable: true,
  get: () => buildersFlow.createFlowUnionType.default
});

Object.defineProperty(exports, "createFlowUnionType", {
  enumerable: true,
  get: () => buildersFlow.createFlowUnionType.default
});

Object.defineProperty(exports, "createTSUnionType", {
  enumerable: true,
  get: () => buildersTS.createTSUnionType.default
});

Object.defineProperty(exports, "cloneNode", {
  enumerable: true,
  get: () => clone.cloneNode.default
});

// Continue with similar `Object.defineProperty` blocks for all other exported functions...

exports.react = {
  isReactComponent: react.isReactComponent.default,
  isCompatTag: react.isCompatTag.default,
  buildChildren: react.buildChildren.default
};

// Iterate through and add other generated and utilities to exports if not already defined
[constantsGenerated, buildersGenerated, buildersUpperCase].forEach((module) => {
  Object.keys(module).forEach((key) => {
    if (key === "default" || key === "__esModule") return;
    if (_exportNames[key]) return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => module[key]
    });
  });
});

// Process all traverse imports
Object.keys(traverseModule).forEach((key) => {
  if (_exportNames[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: () => traverseModule[key]
  });
});

// Handle utils exports
Object.defineProperty(exports, "shallowEqual", {
  enumerable: true,
  get: () => utils.shallowEqual.default
});

// Systematically process and export all necessary modules
[validators, validatorsGenerated, astTypesGenerated].forEach((module) => {
  Object.keys(module).forEach((key) => {
    if (_exportNames[key]) return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => module[key]
    });
  });
});
