"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterDefinition = void 0;
const DefinitionBase_1 = require("./DefinitionBase");
const DefinitionType_1 = require("./DefinitionType");
class ParameterDefinition extends DefinitionBase_1.DefinitionBase {
    /**
     * Whether the parameter definition is a part of a rest parameter.
     */
    rest;
    constructor(name, node, rest) {
        super(DefinitionType_1.DefinitionType.Parameter, name, node, null);
        this.rest = rest;
    }
    isTypeDefinition = false;
    isVariableDefinition = true;
}
exports.ParameterDefinition = ParameterDefinition;
//# sourceMappingURL=ParameterDefinition.js.map