"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const functionMappings = {
  'assertNode': require('./asserts/assertNode').default,
  'createTypeAnnotationBasedOnTypeof': require('./builders/flow/createTypeAnnotationBasedOnTypeof').default,
  'createUnionTypeAnnotation': require('./builders/flow/createFlowUnionType').default,
  'createFlowUnionType': require('./builders/flow/createFlowUnionType').default,
  'createTSUnionType': require('./builders/typescript/createTSUnionType').default,
  'cloneNode': require('./clone/cloneNode').default,
  'clone': require('./clone/clone').default,
  'cloneDeep': require('./clone/cloneDeep').default,
  'cloneDeepWithoutLoc': require('./clone/cloneDeepWithoutLoc').default,
  'cloneWithoutLoc': require('./clone/cloneWithoutLoc').default,
  'addComment': require('./comments/addComment').default,
  'addComments': require('./comments/addComments').default,
  'inheritInnerComments': require('./comments/inheritInnerComments').default,
  'inheritLeadingComments': require('./comments/inheritLeadingComments').default,
  'inheritsComments': require('./comments/inheritsComments').default,
  'inheritTrailingComments': require('./comments/inheritTrailingComments').default,
  'removeComments': require('./comments/removeComments').default,
  'ensureBlock': require('./converters/ensureBlock').default,
  'toBindingIdentifierName': require('./converters/toBindingIdentifierName').default,
  'toBlock': require('./converters/toBlock').default,
  'toComputedKey': require('./converters/toComputedKey').default,
  'toExpression': require('./converters/toExpression').default,
  'toIdentifier': require('./converters/toIdentifier').default,
  'toKeyAlias': require('./converters/toKeyAlias').default,
  'toSequenceExpression': require('./converters/toSequenceExpression').default,
  'toStatement': require('./converters/toStatement').default,
  'valueToNode': require('./converters/valueToNode').default,
  'appendToMemberExpression': require('./modifications/appendToMemberExpression').default,
  'inherits': require('./modifications/inherits').default,
  'prependToMemberExpression': require('./modifications/prependToMemberExpression').default,
  'removeProperties': require('./modifications/removeProperties').default,
  'removePropertiesDeep': require('./modifications/removePropertiesDeep').default,
  'removeTypeDuplicates': require('./modifications/flow/removeTypeDuplicates').default,
  'getBindingIdentifiers': require('./retrievers/getBindingIdentifiers').default,
  'getOuterBindingIdentifiers': require('./retrievers/getOuterBindingIdentifiers').default,
  'traverse': require('./traverse/traverse').default,
  'traverseFast': require('./traverse/traverseFast').default,
  'shallowEqual': require('./utils/shallowEqual').default,
  'is': require('./validators/is').default,
  'isBinding': require('./validators/isBinding').default,
  'isBlockScoped': require('./validators/isBlockScoped').default,
  'isImmutable': require('./validators/isImmutable').default,
  'isLet': require('./validators/isLet').default,
  'isNode': require('./validators/isNode').default,
  'isNodesEquivalent': require('./validators/isNodesEquivalent').default,
  'isPlaceholderType': require('./validators/isPlaceholderType').default,
  'isReferenced': require('./validators/isReferenced').default,
  'isScope': require('./validators/isScope').default,
  'isSpecifierDefault': require('./validators/isSpecifierDefault').default,
  'isType': require('./validators/isType').default,
  'isValidES3Identifier': require('./validators/isValidES3Identifier').default,
  'isValidIdentifier': require('./validators/isValidIdentifier').default,
  'isVar': require('./validators/isVar').default,
  'matchesPattern': require('./validators/matchesPattern').default,
  'validate': require('./validators/validate').default,
  'buildMatchMemberExpression': require('./validators/buildMatchMemberExpression').default,
};

const react = {
  'isReactComponent': require('./validators/react/isReactComponent').default,
  'isCompatTag': require('./validators/react/isCompatTag').default,
  'buildChildren': require('./builders/react/buildChildren').default
};

exports.react = react;

Object.keys(functionMappings).forEach((key) => {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return functionMappings[key];
    }
  });
});

// Add other modules like _generated, _uppercase, _definitions, etc.
const additionalModules = [
  require('./asserts/generated'),
  require('./builders/generated'),
  require('./builders/generated/uppercase'),
  require('./constants/generated'),
  require('./constants'),
  require('./definitions'),
  require('./validators/generated'),
  require('./ast-types/generated')
];

additionalModules.forEach((module) => {
  Object.keys(module).forEach((key) => {
    if (key === "default" || key === "__esModule" || exports.hasOwnProperty(key) && exports[key] === module[key]) return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return module[key];
      }
    });
  });
});
