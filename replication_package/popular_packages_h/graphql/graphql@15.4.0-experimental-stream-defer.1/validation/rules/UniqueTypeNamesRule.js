"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UniqueTypeNamesRule = UniqueTypeNamesRule;

var _GraphQLError = require("../../error/GraphQLError.js");

/**
 * Unique type names
 *
 * A GraphQL document is only valid if all defined types have unique names.
 */
function UniqueTypeNamesRule(context) {
  var knownTypeNames = Object.create(null);
  var schema = context.getSchema();
  return {
    ScalarTypeDefinition: checkTypeName,
    ObjectTypeDefinition: checkTypeName,
    InterfaceTypeDefinition: checkTypeName,
    UnionTypeDefinition: checkTypeName,
    EnumTypeDefinition: checkTypeName,
    InputObjectTypeDefinition: checkTypeName
  };

  function checkTypeName(node) {
    var typeName = node.name.value;

    if (schema === null || schema === void 0 ? void 0 : schema.getType(typeName)) {
      context.reportError(new _GraphQLError.GraphQLError("Type \"".concat(typeName, "\" already exists in the schema. It cannot also be defined in this type definition."), node.name));
      return;
    }

    if (knownTypeNames[typeName]) {
      context.reportError(new _GraphQLError.GraphQLError("There can be only one type named \"".concat(typeName, "\"."), [knownTypeNames[typeName], node.name]));
    } else {
      knownTypeNames[typeName] = node.name;
    }

    return false;
  }
}
