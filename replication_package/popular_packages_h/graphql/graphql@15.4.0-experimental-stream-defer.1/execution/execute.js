"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.executeSync = executeSync;
exports.assertValidExecutionArguments = assertValidExecutionArguments;
exports.buildExecutionContext = buildExecutionContext;
exports.executeOperation = executeOperation;
exports.collectFields = collectFields;
exports.buildResolveInfo = buildResolveInfo;
exports.getFieldDef = getFieldDef;
exports.Dispatcher = exports.defaultFieldResolver = exports.defaultTypeResolver = void 0;

var _arrayFrom = _interopRequireDefault(require("../polyfills/arrayFrom.js"));

var _symbols = require("../polyfills/symbols.js");

var _inspect = _interopRequireDefault(require("../jsutils/inspect.js"));

var _memoize = _interopRequireDefault(require("../jsutils/memoize3.js"));

var _invariant = _interopRequireDefault(require("../jsutils/invariant.js"));

var _devAssert = _interopRequireDefault(require("../jsutils/devAssert.js"));

var _isPromise = _interopRequireDefault(require("../jsutils/isPromise.js"));

var _isAsyncIterable = _interopRequireDefault(require("../jsutils/isAsyncIterable.js"));

var _isObjectLike = _interopRequireDefault(require("../jsutils/isObjectLike.js"));

var _isCollection = _interopRequireDefault(require("../jsutils/isCollection.js"));

var _promiseReduce = _interopRequireDefault(require("../jsutils/promiseReduce.js"));

var _promiseForObject = _interopRequireDefault(require("../jsutils/promiseForObject.js"));

var _Path = require("../jsutils/Path.js");

var _GraphQLError = require("../error/GraphQLError.js");

var _locatedError = require("../error/locatedError.js");

var _kinds = require("../language/kinds.js");

var _validate = require("../type/validate.js");

var _introspection = require("../type/introspection.js");

var _directives = require("../type/directives.js");

var _definition = require("../type/definition.js");

var _typeFromAST = require("../utilities/typeFromAST.js");

var _getOperationRootType = require("../utilities/getOperationRootType.js");

var _values = require("./values.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function execute(argsOrSchema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver) {
  /* eslint-enable no-redeclare */
  // Extract arguments from object args if provided.
  return arguments.length === 1 ? executeImpl(argsOrSchema) : executeImpl({
    schema: argsOrSchema,
    document: document,
    rootValue: rootValue,
    contextValue: contextValue,
    variableValues: variableValues,
    operationName: operationName,
    fieldResolver: fieldResolver,
    typeResolver: typeResolver
  });
}
/**
 * Also implements the "Evaluating requests" section of the GraphQL specification.
 * However, it guarantees to complete synchronously (or throw an error) assuming
 * that all field resolvers are also synchronous.
 */


function executeSync(args) {
  var result = executeImpl(args); // Assert that the execution was synchronous.

  if ((0, _isPromise.default)(result) || (0, _isAsyncIterable.default)(result)) {
    throw new Error('GraphQL execution failed to complete synchronously.');
  } // Note: Flow can't refine isAsyncIterable, so explicit casts are used.


  return result;
}

function executeImpl(args) {
  var schema = args.schema,
      document = args.document,
      rootValue = args.rootValue,
      contextValue = args.contextValue,
      variableValues = args.variableValues,
      operationName = args.operationName,
      fieldResolver = args.fieldResolver,
      typeResolver = args.typeResolver; // If arguments are missing or incorrect, throw an error.

  assertValidExecutionArguments(schema, document, variableValues); // If a valid execution context cannot be created due to incorrect arguments,
  // a "Response" with only errors is returned.

  var exeContext = buildExecutionContext(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver); // Return early errors if execution context failed.

  if (Array.isArray(exeContext)) {
    return {
      errors: exeContext
    };
  } // Return a Promise that will eventually resolve to the data described by
  // The "Response" section of the GraphQL specification.
  //
  // If errors are encountered while executing a GraphQL field, only that
  // field and its descendants will be omitted, and sibling fields will still
  // be executed. An execution which encounters errors will still result in a
  // resolved Promise.


  var data = executeOperation(exeContext, exeContext.operation, rootValue);
  return buildResponse(exeContext, data);
}
/**
 * Given a completed execution context and data, build the { errors, data }
 * response defined by the "Response" section of the GraphQL specification.
 */


function buildResponse(exeContext, data) {
  if ((0, _isPromise.default)(data)) {
    return data.then(function (resolved) {
      return buildResponse(exeContext, resolved);
    });
  }

  var initialResult = exeContext.errors.length === 0 ? {
    data: data
  } : {
    errors: exeContext.errors,
    data: data
  };

  if (exeContext.dispatcher.hasSubsequentPayloads()) {
    return exeContext.dispatcher.get(initialResult);
  }

  return initialResult;
}
/**
 * Essential assertions before executing to provide developer feedback for
 * improper use of the GraphQL library.
 *
 * @internal
 */


function assertValidExecutionArguments(schema, document, rawVariableValues) {
  document || (0, _devAssert.default)(0, 'Must provide document.'); // If the schema used for execution is invalid, throw an error.

  (0, _validate.assertValidSchema)(schema); // Variables, if provided, must be an object.

  rawVariableValues == null || (0, _isObjectLike.default)(rawVariableValues) || (0, _devAssert.default)(0, 'Variables must be provided as an Object where each property is a variable value. Perhaps look to see if an unparsed JSON string was provided.');
}
/**
 * Constructs a ExecutionContext object from the arguments passed to
 * execute, which we will pass throughout the other execution methods.
 *
 * Throws a GraphQLError if a valid execution context cannot be created.
 *
 * @internal
 */


function buildExecutionContext(schema, document, rootValue, contextValue, rawVariableValues, operationName, fieldResolver, typeResolver) {
  var _definition$name, _operation$variableDe;

  var operation;
  var fragments = Object.create(null);

  for (var _i2 = 0, _document$definitions2 = document.definitions; _i2 < _document$definitions2.length; _i2++) {
    var definition = _document$definitions2[_i2];

    switch (definition.kind) {
      case _kinds.Kind.OPERATION_DEFINITION:
        if (operationName == null) {
          if (operation !== undefined) {
            return [new _GraphQLError.GraphQLError('Must provide operation name if query contains multiple operations.')];
          }

          operation = definition;
        } else if (((_definition$name = definition.name) === null || _definition$name === void 0 ? void 0 : _definition$name.value) === operationName) {
          operation = definition;
        }

        break;

      case _kinds.Kind.FRAGMENT_DEFINITION:
        fragments[definition.name.value] = definition;
        break;
    }
  }

  if (!operation) {
    if (operationName != null) {
      return [new _GraphQLError.GraphQLError("Unknown operation named \"".concat(operationName, "\"."))];
    }

    return [new _GraphQLError.GraphQLError('Must provide an operation.')];
  } // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2203')


  var variableDefinitions = (_operation$variableDe = operation.variableDefinitions) !== null && _operation$variableDe !== void 0 ? _operation$variableDe : [];
  var coercedVariableValues = (0, _values.getVariableValues)(schema, variableDefinitions, rawVariableValues !== null && rawVariableValues !== void 0 ? rawVariableValues : {}, {
    maxErrors: 50
  });

  if (coercedVariableValues.errors) {
    return coercedVariableValues.errors;
  }

  return {
    schema: schema,
    fragments: fragments,
    rootValue: rootValue,
    contextValue: contextValue,
    operation: operation,
    variableValues: coercedVariableValues.coerced,
    fieldResolver: fieldResolver !== null && fieldResolver !== void 0 ? fieldResolver : defaultFieldResolver,
    typeResolver: typeResolver !== null && typeResolver !== void 0 ? typeResolver : defaultTypeResolver,
    dispatcher: new Dispatcher(),
    errors: []
  };
}
/**
 * Implements the "Evaluating operations" section of the spec.
 */


function executeOperation(exeContext, operation, rootValue) {
  var type = (0, _getOperationRootType.getOperationRootType)(exeContext.schema, operation);

  var _collectFields = collectFields(exeContext, type, operation.selectionSet, Object.create(null), [], Object.create(null)),
      fields = _collectFields.fields,
      patches = _collectFields.patches;

  var path = undefined; // Errors from sub-fields of a NonNull type may propagate to the top level,
  // at which point we still log the error and null the parent field, which
  // in this case is the entire response.

  try {
    var result;

    if (operation.operation === 'mutation') {
      result = executeFieldsSerially(exeContext, type, rootValue, path, fields);
    } else {
      result = executeFields(exeContext, type, rootValue, path, fields, exeContext.errors);
    }

    for (var _i4 = 0; _i4 < patches.length; _i4++) {
      var patch = patches[_i4];
      var label = patch.label,
          patchFields = patch.fields;
      var errors = [];
      exeContext.dispatcher.addFields(label, path, executeFields(exeContext, type, rootValue, path, patchFields, errors), errors);
    }

    if ((0, _isPromise.default)(result)) {
      return result.then(undefined, function (error) {
        exeContext.errors.push(error);
        return Promise.resolve(null);
      });
    }

    return result;
  } catch (error) {
    exeContext.errors.push(error);
    return null;
  }
}
/**
 * Implements the "Evaluating selection sets" section of the spec
 * for "write" mode.
 */


function executeFieldsSerially(exeContext, parentType, sourceValue, path, fields) {
  return (0, _promiseReduce.default)(Object.keys(fields), function (results, responseName) {
    var fieldNodes = fields[responseName];
    var fieldPath = (0, _Path.addPath)(path, responseName, parentType.name);
    var result = resolveField(exeContext, parentType, sourceValue, fieldNodes, fieldPath, exeContext.errors);

    if (result === undefined) {
      return results;
    }

    if ((0, _isPromise.default)(result)) {
      return result.then(function (resolvedResult) {
        results[responseName] = resolvedResult;
        return results;
      });
    }

    results[responseName] = result;
    return results;
  }, Object.create(null));
}
/**
 * Implements the "Evaluating selection sets" section of the spec
 * for "read" mode.
 */


function executeFields(exeContext, parentType, sourceValue, path, fields, errors) {
  var results = Object.create(null);
  var containsPromise = false;

  for (var _i6 = 0, _Object$keys2 = Object.keys(fields); _i6 < _Object$keys2.length; _i6++) {
    var responseName = _Object$keys2[_i6];
    var fieldNodes = fields[responseName];
    var fieldPath = (0, _Path.addPath)(path, responseName, parentType.name);
    var result = resolveField(exeContext, parentType, sourceValue, fieldNodes, fieldPath, errors);

    if (result !== undefined) {
      results[responseName] = result;

      if ((0, _isPromise.default)(result)) {
        containsPromise = true;
      }
    }
  } // If there are no promises, we can just return the object


  if (!containsPromise) {
    return results;
  } // Otherwise, results is a map from field name to the result of resolving that
  // field, which is possibly a promise. Return a promise that will return this
  // same map, but with any promises replaced with the values they resolved to.


  return (0, _promiseForObject.default)(results);
}
/**
 * Given a selectionSet, adds all of the fields in that selection to
 * the passed in map of fields, and returns it at the end.
 *
 * CollectFields requires the "runtime type" of an object. For a field which
 * returns an Interface or Union type, the "runtime type" will be the actual
 * Object type returned by that field.
 *
 * @internal
 */


function collectFields(exeContext, runtimeType, selectionSet, fields, patches, visitedFragmentNames) {
  for (var _i8 = 0, _selectionSet$selecti2 = selectionSet.selections; _i8 < _selectionSet$selecti2.length; _i8++) {
    var selection = _selectionSet$selecti2[_i8];

    switch (selection.kind) {
      case _kinds.Kind.FIELD:
        {
          if (!shouldIncludeNode(exeContext, selection)) {
            continue;
          }

          var name = getFieldEntryKey(selection);

          if (!fields[name]) {
            fields[name] = [];
          }

          fields[name].push(selection);
          break;
        }

      case _kinds.Kind.INLINE_FRAGMENT:
        {
          if (!shouldIncludeNode(exeContext, selection) || !doesFragmentConditionMatch(exeContext, selection, runtimeType)) {
            continue;
          }

          var defer = getDeferValues(exeContext, selection);

          if (defer) {
            var _collectFields2 = collectFields(exeContext, runtimeType, selection.selectionSet, Object.create(null), patches, visitedFragmentNames),
                patchFields = _collectFields2.fields;

            patches.push({
              label: defer.label,
              fields: patchFields
            });
          } else {
            collectFields(exeContext, runtimeType, selection.selectionSet, fields, patches, visitedFragmentNames);
          }

          break;
        }

      case _kinds.Kind.FRAGMENT_SPREAD:
        {
          var fragName = selection.name.value;

          if (!shouldIncludeNode(exeContext, selection)) {
            continue;
          }

          var _defer = getDeferValues(exeContext, selection);

          if (visitedFragmentNames[fragName] && // Cannot continue in this case because fields must be recollected for patch
          !_defer) {
            continue;
          }

          visitedFragmentNames[fragName] = true;
          var fragment = exeContext.fragments[fragName];

          if (!fragment || !doesFragmentConditionMatch(exeContext, fragment, runtimeType)) {
            continue;
          }

          if (_defer) {
            var _collectFields3 = collectFields(exeContext, runtimeType, fragment.selectionSet, Object.create(null), patches, visitedFragmentNames),
                _patchFields = _collectFields3.fields;

            patches.push({
              label: _defer.label,
              fields: _patchFields
            });
          } else {
            collectFields(exeContext, runtimeType, fragment.selectionSet, fields, patches, visitedFragmentNames);
          }

          break;
        }
    }
  }

  return {
    fields: fields,
    patches: patches
  };
}
/**
 * Determines if a field should be included based on the @include and @skip
 * directives, where @skip has higher precedence than @include.
 */


function shouldIncludeNode(exeContext, node) {
  var skip = (0, _values.getDirectiveValues)(_directives.GraphQLSkipDirective, node, exeContext.variableValues);

  if ((skip === null || skip === void 0 ? void 0 : skip.if) === true) {
    return false;
  }

  var include = (0, _values.getDirectiveValues)(_directives.GraphQLIncludeDirective, node, exeContext.variableValues);

  if ((include === null || include === void 0 ? void 0 : include.if) === false) {
    return false;
  }

  return true;
}
/**
 * Returns an object containing the @defer arguments if a field should be
 * deferred based on the experimental flag, defer directive present and
 * not disabled by the "if" argument.
 */


function getDeferValues(exeContext, node) {
  var defer = (0, _values.getDirectiveValues)(_directives.GraphQLDeferDirective, node, exeContext.variableValues);

  if (!defer) {
    return;
  }

  if (defer.if === false) {
    return;
  }

  return {
    label: typeof defer.label === 'string' ? defer.label : undefined
  };
}
/**
 * Returns an object containing the @stream arguments if a field should be
 * streamed based on the experimental flag, stream directive present and
 * not disabled by the "if" argument.
 */


function getStreamValues(exeContext, fieldNodes) {
  // validation only allows equivalent streams on multiple fields, so it is
  // safe to only check the first fieldNode for the stream directive
  var stream = (0, _values.getDirectiveValues)(_directives.GraphQLStreamDirective, fieldNodes[0], exeContext.variableValues);

  if (!stream) {
    return;
  }

  if (stream.if === false) {
    return;
  }

  return {
    initialCount: // istanbul ignore next (initialCount is required number argument)
    typeof stream.initialCount === 'number' ? stream.initialCount : undefined,
    label: typeof stream.label === 'string' ? stream.label : undefined
  };
}
/**
 * Determines if a fragment is applicable to the given type.
 */


function doesFragmentConditionMatch(exeContext, fragment, type) {
  var typeConditionNode = fragment.typeCondition;

  if (!typeConditionNode) {
    return true;
  }

  var conditionalType = (0, _typeFromAST.typeFromAST)(exeContext.schema, typeConditionNode);

  if (conditionalType === type) {
    return true;
  }

  if ((0, _definition.isAbstractType)(conditionalType)) {
    return exeContext.schema.isSubType(conditionalType, type);
  }

  return false;
}
/**
 * Implements the logic to compute the key of a given field's entry
 */


function getFieldEntryKey(node) {
  return node.alias ? node.alias.value : node.name.value;
}
/**
 * Resolves the field on the given source object. In particular, this
 * figures out the value that the field returns by calling its resolve function,
 * then calls completeValue to complete promises, serialize scalars, or execute
 * the sub-selection-set for objects.
 */


function resolveField(exeContext, parentType, source, fieldNodes, path, errors) {
  var _fieldDef$resolve;

  var fieldNode = fieldNodes[0];
  var fieldName = fieldNode.name.value;
  var fieldDef = getFieldDef(exeContext.schema, parentType, fieldName);

  if (!fieldDef) {
    return;
  }

  var returnType = fieldDef.type;
  var resolveFn = (_fieldDef$resolve = fieldDef.resolve) !== null && _fieldDef$resolve !== void 0 ? _fieldDef$resolve : exeContext.fieldResolver;
  var info = buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path); // Get the resolve function, regardless of if its result is normal or abrupt (error).

  try {
    // Build a JS object of arguments from the field.arguments AST, using the
    // variables scope to fulfill any variable references.
    // TODO: find a way to memoize, in case this field is within a List type.
    var args = (0, _values.getArgumentValues)(fieldDef, fieldNodes[0], exeContext.variableValues); // The resolve function's optional third argument is a context value that
    // is provided to every resolve function within an execution. It is commonly
    // used to represent an authenticated user, or request-specific caches.

    var _contextValue = exeContext.contextValue;
    var result = resolveFn(source, args, _contextValue, info);
    var completed;

    if ((0, _isPromise.default)(result)) {
      completed = result.then(function (resolved) {
        return completeValue(exeContext, returnType, fieldNodes, info, path, resolved, errors);
      });
    } else {
      completed = completeValue(exeContext, returnType, fieldNodes, info, path, result, errors);
    }

    if ((0, _isPromise.default)(completed)) {
      // Note: we don't rely on a `catch` method, but we do expect "thenable"
      // to take a second callback for the error case.
      return completed.then(undefined, function (rawError) {
        var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(path));
        return handleFieldError(error, returnType, errors);
      });
    }

    return completed;
  } catch (rawError) {
    var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(path));
    return handleFieldError(error, returnType, errors);
  }
}
/**
 * @internal
 */


function buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path) {
  // The resolve function's optional fourth argument is a collection of
  // information about the current execution state.
  return {
    fieldName: fieldDef.name,
    fieldNodes: fieldNodes,
    returnType: fieldDef.type,
    parentType: parentType,
    path: path,
    schema: exeContext.schema,
    fragments: exeContext.fragments,
    rootValue: exeContext.rootValue,
    operation: exeContext.operation,
    variableValues: exeContext.variableValues
  };
}

function handleFieldError(error, returnType, errors) {
  // If the field type is non-nullable, then it is resolved without any
  // protection from errors, however it still properly locates the error.
  if ((0, _definition.isNonNullType)(returnType)) {
    throw error;
  } // Otherwise, error protection is applied, logging the error and resolving
  // a null value for this field if one is encountered.


  errors.push(error);
  return null;
}
/**
 * Implements the instructions for completeValue as defined in the
 * "Field entries" section of the spec.
 *
 * If the field type is Non-Null, then this recursively completes the value
 * for the inner type. It throws a field error if that completion returns null,
 * as per the "Nullability" section of the spec.
 *
 * If the field type is a List, then this recursively completes the value
 * for the inner type on each item in the list.
 *
 * If the field type is a Scalar or Enum, ensures the completed value is a legal
 * value of the type by calling the `serialize` method of GraphQL type
 * definition.
 *
 * If the field is an abstract type, determine the runtime type of the value
 * and then complete based on that type
 *
 * Otherwise, the field type expects a sub-selection set, and will complete the
 * value by evaluating all sub-selections.
 */


function completeValue(exeContext, returnType, fieldNodes, info, path, result, errors) {
  // If result is an Error, throw a located error.
  if (result instanceof Error) {
    throw result;
  } // If field type is NonNull, complete for inner type, and throw field error
  // if result is null.


  if ((0, _definition.isNonNullType)(returnType)) {
    var completed = completeValue(exeContext, returnType.ofType, fieldNodes, info, path, result, errors);

    if (completed === null) {
      throw new Error("Cannot return null for non-nullable field ".concat(info.parentType.name, ".").concat(info.fieldName, "."));
    }

    return completed;
  } // If result value is null or undefined then return null.


  if (result == null) {
    return null;
  } // If field type is List, complete each item in the list with the inner type


  if ((0, _definition.isListType)(returnType)) {
    return completeListValue(exeContext, returnType, fieldNodes, info, path, result, errors);
  } // If field type is a leaf type, Scalar or Enum, serialize to a valid value,
  // returning null if serialization is not possible.


  if ((0, _definition.isLeafType)(returnType)) {
    return completeLeafValue(returnType, result);
  } // If field type is an abstract type, Interface or Union, determine the
  // runtime Object type and complete for that type.


  if ((0, _definition.isAbstractType)(returnType)) {
    return completeAbstractValue(exeContext, returnType, fieldNodes, info, path, result, errors);
  } // If field type is Object, execute and complete all sub-selections.
  // istanbul ignore else (See: 'https://github.com/graphql/graphql-js/issues/2618')


  if ((0, _definition.isObjectType)(returnType)) {
    return completeObjectValue(exeContext, returnType, fieldNodes, info, path, result, errors);
  } // istanbul ignore next (Not reachable. All possible output types have been considered)


  false || (0, _invariant.default)(0, 'Cannot complete value of unexpected output type: ' + (0, _inspect.default)(returnType));
}
/**
 * Complete a async iterator value by completing the result and calling
 * recursively until all the results are completed.
 */


function completeAsyncIteratorValue(exeContext, itemType, fieldNodes, info, path, iterator, errors) {
  var containsPromise = false;
  var stream = getStreamValues(exeContext, fieldNodes);
  return new Promise(function (resolve) {
    function next(index, completedResults) {
      var fieldPath = (0, _Path.addPath)(path, index, undefined);
      iterator.next().then(function (_ref) {
        var value = _ref.value,
            done = _ref.done;

        if (done) {
          resolve(completedResults);
          return;
        } // TODO can the error checking logic be consolidated with completeListValue?


        try {
          var completedItem = completeValue(exeContext, itemType, fieldNodes, info, fieldPath, value, errors);

          if ((0, _isPromise.default)(completedItem)) {
            containsPromise = true;
          }

          completedResults.push(completedItem);
        } catch (rawError) {
          completedResults.push(null);
          var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(fieldPath));
          handleFieldError(error, itemType, errors);
          resolve(completedResults);
          return;
        }

        var newIndex = index + 1;

        if (stream && typeof stream.initialCount === 'number' && newIndex >= stream.initialCount) {
          exeContext.dispatcher.addAsyncIteratorValue(stream.label, newIndex, path, iterator, exeContext, fieldNodes, info, itemType);
          resolve(completedResults);
          return;
        }

        next(newIndex, completedResults);
      }, function (rawError) {
        completedResults.push(null);
        var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(fieldPath));
        handleFieldError(error, itemType, errors);
        resolve(completedResults);
      });
    }

    next(0, []);
  }).then(function (completedResults) {
    return containsPromise ? Promise.all(completedResults) : completedResults;
  });
}
/**
 * Complete a list value by completing each item in the list with the
 * inner type
 */


function completeListValue(exeContext, returnType, fieldNodes, info, path, result, errors) {
  var itemType = returnType.ofType;

  if ((0, _isAsyncIterable.default)(result)) {
    var iterator = result[_symbols.SYMBOL_ASYNC_ITERATOR]();

    return completeAsyncIteratorValue(exeContext, itemType, fieldNodes, info, path, iterator, errors);
  }

  if (!(0, _isCollection.default)(result)) {
    throw new _GraphQLError.GraphQLError("Expected Iterable, but did not find one for field \"".concat(info.parentType.name, ".").concat(info.fieldName, "\"."));
  }

  var stream = getStreamValues(exeContext, fieldNodes); // This is specified as a simple map, however we're optimizing the path
  // where the list contains no Promises by avoiding creating another Promise.

  var containsPromise = false;
  var completedResults = (0, _arrayFrom.default)(result, function (item, index) {
    // No need to modify the info object containing the path,
    // since from here on it is not ever accessed by resolver functions.
    var itemPath = (0, _Path.addPath)(path, index, undefined);

    try {
      var completedItem;

      if (stream && typeof stream.initialCount === 'number' && index >= stream.initialCount) {
        exeContext.dispatcher.addValue(stream.label, itemPath, item, exeContext, fieldNodes, info, itemType);
        return;
      }

      if ((0, _isPromise.default)(item)) {
        completedItem = item.then(function (resolved) {
          return completeValue(exeContext, itemType, fieldNodes, info, itemPath, resolved, errors);
        });
      } else {
        completedItem = completeValue(exeContext, itemType, fieldNodes, info, itemPath, item, errors);
      }

      if ((0, _isPromise.default)(completedItem)) {
        containsPromise = true; // Note: we don't rely on a `catch` method, but we do expect "thenable"
        // to take a second callback for the error case.

        return completedItem.then(undefined, function (rawError) {
          var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(itemPath));
          return handleFieldError(error, itemType, errors);
        });
      }

      return completedItem;
    } catch (rawError) {
      var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(itemPath));
      return handleFieldError(error, itemType, errors);
    }
  }).filter(function (val) {
    return val !== undefined;
  });
  return containsPromise ? Promise.all(completedResults) : completedResults;
}
/**
 * Complete a Scalar or Enum by serializing to a valid value, returning
 * null if serialization is not possible.
 */


function completeLeafValue(returnType, result) {
  var serializedResult = returnType.serialize(result);

  if (serializedResult === undefined) {
    throw new Error("Expected a value of type \"".concat((0, _inspect.default)(returnType), "\" but ") + "received: ".concat((0, _inspect.default)(result)));
  }

  return serializedResult;
}
/**
 * Complete a value of an abstract type by determining the runtime object type
 * of that value, then complete the value for that type.
 */


function completeAbstractValue(exeContext, returnType, fieldNodes, info, path, result, errors) {
  var _returnType$resolveTy;

  var resolveTypeFn = (_returnType$resolveTy = returnType.resolveType) !== null && _returnType$resolveTy !== void 0 ? _returnType$resolveTy : exeContext.typeResolver;
  var contextValue = exeContext.contextValue;
  var runtimeType = resolveTypeFn(result, contextValue, info, returnType);

  if ((0, _isPromise.default)(runtimeType)) {
    return runtimeType.then(function (resolvedRuntimeType) {
      return completeObjectValue(exeContext, ensureValidRuntimeType(resolvedRuntimeType, exeContext, returnType, fieldNodes, info, result), fieldNodes, info, path, result, errors);
    });
  }

  return completeObjectValue(exeContext, ensureValidRuntimeType(runtimeType, exeContext, returnType, fieldNodes, info, result), fieldNodes, info, path, result, errors);
}

function ensureValidRuntimeType(runtimeTypeOrName, exeContext, returnType, fieldNodes, info, result) {
  if (runtimeTypeOrName == null) {
    throw new _GraphQLError.GraphQLError("Abstract type \"".concat(returnType.name, "\" must resolve to an Object type at runtime for field \"").concat(info.parentType.name, ".").concat(info.fieldName, "\". Either the \"").concat(returnType.name, "\" type should provide a \"resolveType\" function or each possible type should provide an \"isTypeOf\" function."), fieldNodes);
  } // FIXME: temporary workaround until support for passing object types would be removed in v16.0.0


  var runtimeTypeName = (0, _definition.isNamedType)(runtimeTypeOrName) ? runtimeTypeOrName.name : runtimeTypeOrName;

  if (typeof runtimeTypeName !== 'string') {
    throw new _GraphQLError.GraphQLError("Abstract type \"".concat(returnType.name, "\" must resolve to an Object type at runtime for field \"").concat(info.parentType.name, ".").concat(info.fieldName, "\" with ") + "value ".concat((0, _inspect.default)(result), ", received \"").concat((0, _inspect.default)(runtimeTypeOrName), "\"."));
  }

  var runtimeType = exeContext.schema.getType(runtimeTypeName);

  if (runtimeType == null) {
    throw new _GraphQLError.GraphQLError("Abstract type \"".concat(returnType.name, "\" was resolve to a type \"").concat(runtimeTypeName, "\" that does not exist inside schema."), fieldNodes);
  }

  if (!(0, _definition.isObjectType)(runtimeType)) {
    throw new _GraphQLError.GraphQLError("Abstract type \"".concat(returnType.name, "\" was resolve to a non-object type \"").concat(runtimeTypeName, "\"."), fieldNodes);
  }

  if (!exeContext.schema.isSubType(returnType, runtimeType)) {
    throw new _GraphQLError.GraphQLError("Runtime Object type \"".concat(runtimeType.name, "\" is not a possible type for \"").concat(returnType.name, "\"."), fieldNodes);
  }

  return runtimeType;
}
/**
 * Complete an Object value by executing all sub-selections.
 */


function completeObjectValue(exeContext, returnType, fieldNodes, info, path, result, errors) {
  // If there is an isTypeOf predicate function, call it with the
  // current result. If isTypeOf returns false, then raise an error rather
  // than continuing execution.
  if (returnType.isTypeOf) {
    var isTypeOf = returnType.isTypeOf(result, exeContext.contextValue, info);

    if ((0, _isPromise.default)(isTypeOf)) {
      return isTypeOf.then(function (resolvedIsTypeOf) {
        if (!resolvedIsTypeOf) {
          throw invalidReturnTypeError(returnType, result, fieldNodes);
        }

        return collectAndExecuteSubfields(exeContext, returnType, fieldNodes, path, result, errors);
      });
    }

    if (!isTypeOf) {
      throw invalidReturnTypeError(returnType, result, fieldNodes);
    }
  }

  return collectAndExecuteSubfields(exeContext, returnType, fieldNodes, path, result, errors);
}

function invalidReturnTypeError(returnType, result, fieldNodes) {
  return new _GraphQLError.GraphQLError("Expected value of type \"".concat(returnType.name, "\" but got: ").concat((0, _inspect.default)(result), "."), fieldNodes);
}

function collectAndExecuteSubfields(exeContext, returnType, fieldNodes, path, result, errors) {
  // Collect sub-fields to execute to complete this value.
  var _collectSubfields2 = collectSubfields(exeContext, returnType, fieldNodes),
      subFieldNodes = _collectSubfields2.fields,
      subPatches = _collectSubfields2.patches;

  var subFields = executeFields(exeContext, returnType, result, path, subFieldNodes, errors);

  for (var _i10 = 0; _i10 < subPatches.length; _i10++) {
    var subPatch = subPatches[_i10];
    var label = subPatch.label,
        subPatchFieldNodes = subPatch.fields;
    var subPatchErrors = [];
    exeContext.dispatcher.addFields(label, path, executeFields(exeContext, returnType, result, path, subPatchFieldNodes, subPatchErrors), subPatchErrors);
  }

  return subFields;
}
/**
 * A memoized collection of relevant subfields with regard to the return
 * type. Memoizing ensures the subfields are not repeatedly calculated, which
 * saves overhead when resolving lists of values.
 */


var collectSubfields = (0, _memoize.default)(_collectSubfields);

function _collectSubfields(exeContext, returnType, fieldNodes) {
  var subFieldNodes = Object.create(null);
  var visitedFragmentNames = Object.create(null);
  var subPatches = [];
  var subFieldsAndPatches = {
    fields: subFieldNodes,
    patches: subPatches
  };

  for (var _i12 = 0; _i12 < fieldNodes.length; _i12++) {
    var node = fieldNodes[_i12];

    if (node.selectionSet) {
      subFieldsAndPatches = collectFields(exeContext, returnType, node.selectionSet, subFieldNodes, subPatches, visitedFragmentNames);
    }
  }

  return subFieldsAndPatches;
}
/**
 * If a resolveType function is not given, then a default resolve behavior is
 * used which attempts two strategies:
 *
 * First, See if the provided value has a `__typename` field defined, if so, use
 * that value as name of the resolved type.
 *
 * Otherwise, test each possible type for the abstract type by calling
 * isTypeOf for the object being coerced, returning the first type that matches.
 */


var defaultTypeResolver = function defaultTypeResolver(value, contextValue, info, abstractType) {
  // First, look for `__typename`.
  if ((0, _isObjectLike.default)(value) && typeof value.__typename === 'string') {
    return value.__typename;
  } // Otherwise, test each possible type.


  var possibleTypes = info.schema.getPossibleTypes(abstractType);
  var promisedIsTypeOfResults = [];

  for (var i = 0; i < possibleTypes.length; i++) {
    var type = possibleTypes[i];

    if (type.isTypeOf) {
      var isTypeOfResult = type.isTypeOf(value, contextValue, info);

      if ((0, _isPromise.default)(isTypeOfResult)) {
        promisedIsTypeOfResults[i] = isTypeOfResult;
      } else if (isTypeOfResult) {
        return type.name;
      }
    }
  }

  if (promisedIsTypeOfResults.length) {
    return Promise.all(promisedIsTypeOfResults).then(function (isTypeOfResults) {
      for (var _i13 = 0; _i13 < isTypeOfResults.length; _i13++) {
        if (isTypeOfResults[_i13]) {
          return possibleTypes[_i13].name;
        }
      }
    });
  }
};
/**
 * If a resolve function is not given, then a default resolve behavior is used
 * which takes the property of the source object of the same name as the field
 * and returns it as the result, or if it's a function, returns the result
 * of calling that function while passing along args and context value.
 */


exports.defaultTypeResolver = defaultTypeResolver;

var defaultFieldResolver = function defaultFieldResolver(source, args, contextValue, info) {
  // ensure source is a value for which property access is acceptable.
  if ((0, _isObjectLike.default)(source) || typeof source === 'function') {
    var property = source[info.fieldName];

    if (typeof property === 'function') {
      return source[info.fieldName](args, contextValue, info);
    }

    return property;
  }
};
/**
 * This method looks up the field on the given type definition.
 * It has special casing for the three introspection fields,
 * __schema, __type and __typename. __typename is special because
 * it can always be queried as a field, even in situations where no
 * other fields are allowed, like on a Union. __schema and __type
 * could get automatically added to the query type, but that would
 * require mutating type definitions, which would cause issues.
 *
 * @internal
 */


exports.defaultFieldResolver = defaultFieldResolver;

function getFieldDef(schema, parentType, fieldName) {
  if (fieldName === _introspection.SchemaMetaFieldDef.name && schema.getQueryType() === parentType) {
    return _introspection.SchemaMetaFieldDef;
  } else if (fieldName === _introspection.TypeMetaFieldDef.name && schema.getQueryType() === parentType) {
    return _introspection.TypeMetaFieldDef;
  } else if (fieldName === _introspection.TypeNameMetaFieldDef.name) {
    return _introspection.TypeNameMetaFieldDef;
  }

  return parentType.getFields()[fieldName];
}
/**
 * Same as ExecutionPatchResult, but without hasNext
 */


/**
 * Dispatcher keeps track of subsequent payloads that need to be delivered
 * to the client. After initial execution, returns an async iteratable of
 * all the AsyncExecutionResults as they are resolved.
 */
var Dispatcher = /*#__PURE__*/function () {
  function Dispatcher() {
    this._subsequentPayloads = [];
    this._hasReturnedInitialResult = false;
  }

  var _proto = Dispatcher.prototype;

  _proto.hasSubsequentPayloads = function hasSubsequentPayloads() {
    return this._subsequentPayloads.length !== 0;
  };

  _proto.addFields = function addFields(label, path, promiseOrData, errors) {
    this._subsequentPayloads.push(Promise.resolve(promiseOrData).then(function (data) {
      return {
        value: createPatchResult(data, label, path, errors),
        done: false
      };
    }));
  };

  _proto.addValue = function addValue(label, path, promiseOrData, exeContext, fieldNodes, info, itemType) {
    var errors = [];

    this._subsequentPayloads.push(Promise.resolve(promiseOrData).then(function (resolved) {
      return completeValue(exeContext, itemType, fieldNodes, info, path, resolved, errors);
    }) // Note: we don't rely on a `catch` method, but we do expect "thenable"
    // to take a second callback for the error case.
    .then(undefined, function (rawError) {
      var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(path));
      return handleFieldError(error, itemType, errors);
    }).then(function (data) {
      return {
        value: createPatchResult(data, label, path, errors),
        done: false
      };
    }));
  };

  _proto.addAsyncIteratorValue = function addAsyncIteratorValue(label, initialIndex, path, iterator, exeContext, fieldNodes, info, itemType) {
    var subsequentPayloads = this._subsequentPayloads;

    function next(index) {
      var fieldPath = (0, _Path.addPath)(path, index);
      var patchErrors = [];
      subsequentPayloads.push(iterator.next().then(function (_ref2) {
        var data = _ref2.value,
            done = _ref2.done;

        if (done) {
          return {
            value: undefined,
            done: true
          };
        } // eslint-disable-next-line node/callback-return


        next(index + 1);

        try {
          var completedItem = completeValue(exeContext, itemType, fieldNodes, info, fieldPath, data, patchErrors);

          if ((0, _isPromise.default)(completedItem)) {
            return completedItem.then(function (resolveItem) {
              return {
                value: createPatchResult(resolveItem, label, fieldPath, patchErrors),
                done: false
              };
            });
          }

          return {
            value: createPatchResult(completedItem, label, fieldPath, patchErrors),
            done: false
          };
        } catch (rawError) {
          var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(fieldPath));
          handleFieldError(error, itemType, patchErrors);
          return {
            value: createPatchResult(null, label, fieldPath, patchErrors),
            done: false
          };
        }
      }, function (rawError) {
        var error = (0, _locatedError.locatedError)(rawError, fieldNodes, (0, _Path.pathToArray)(fieldPath));
        handleFieldError(error, itemType, patchErrors);
        return {
          value: createPatchResult(null, label, fieldPath, patchErrors),
          done: false
        };
      }));
    }

    next(initialIndex);
  };

  _proto._race = function _race() {
    var _this = this;

    return new Promise(function (resolve) {
      _this._subsequentPayloads.forEach(function (promise) {
        promise.then(function () {
          // resolve with actual promise, not resolved value of promise so we can remove it from this._subsequentPayloads
          resolve({
            promise: promise
          });
        });
      });
    }).then(function (_ref3) {
      var promise = _ref3.promise;

      _this._subsequentPayloads.splice(_this._subsequentPayloads.indexOf(promise), 1);

      return promise;
    }).then(function (_ref4) {
      var value = _ref4.value,
          done = _ref4.done;

      if (done && _this._subsequentPayloads.length === 0) {
        // async iterable resolver just finished and no more pending payloads
        return {
          value: {
            hasNext: false
          },
          done: false
        };
      } else if (done) {
        // async iterable resolver just finished but there are pending payloads
        // return the next one
        return _this._race();
      }

      var returnValue = _objectSpread(_objectSpread({}, value), {}, {
        hasNext: _this._subsequentPayloads.length > 0
      });

      return {
        value: returnValue,
        done: false
      };
    });
  };

  _proto._next = function _next() {
    if (!this._hasReturnedInitialResult) {
      this._hasReturnedInitialResult = true;
      return Promise.resolve({
        value: _objectSpread(_objectSpread({}, this._initialResult), {}, {
          hasNext: true
        }),
        done: false
      });
    } else if (this._subsequentPayloads.length === 0) {
      return Promise.resolve({
        value: undefined,
        done: true
      });
    }

    return this._race();
  };

  _proto.get = function get(initialResult) {
    var _this2 = this,
        _ref5;

    this._initialResult = initialResult;
    return _ref5 = {}, _defineProperty(_ref5, _symbols.SYMBOL_ASYNC_ITERATOR, function () {
      return this;
    }), _defineProperty(_ref5, "next", function next() {
      return _this2._next();
    }), _ref5;
  };

  return Dispatcher;
}();

exports.Dispatcher = Dispatcher;

function createPatchResult(data, label, path, errors) {
  var value = {
    data: data,
    path: path ? (0, _Path.pathToArray)(path) : []
  };

  if (label != null) {
    value.label = label;
  }

  if (errors && errors.length > 0) {
    value.errors = errors;
  }

  return value;
}
