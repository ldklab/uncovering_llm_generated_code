"use strict";

const assert = require("assert");
const ScopeManager = require("./scope-manager");
const Referencer = require("./referencer");
const Reference = require("./reference");
const Variable = require("./variable");
const { Scope } = require("./scope");
const { version } = require("../package.json");

// Default analysis options
function defaultOptions() {
    return {
        optimistic: false,
        directive: false,
        nodejsScope: false,
        impliedStrict: false,
        sourceType: "script",
        ecmaVersion: 5,
        childVisitorKeys: null,
        fallback: "iteration"
    };
}

// Deeply update target options with override options
function updateDeeply(target, override) {
    function isHashObject(value) {
        return typeof value === "object" && value instanceof Object && !Array.isArray(value) && !(value instanceof RegExp);
    }

    for (const key in override) {
        if (Object.prototype.hasOwnProperty.call(override, key)) {
            const val = override[key];
            if (isHashObject(val)) {
                if (isHashObject(target[key])) {
                    updateDeeply(target[key], val);
                } else {
                    target[key] = updateDeeply({}, val);
                }
            } else {
                target[key] = val;
            }
        }
    }
    return target;
}

// Analyze function using Espree syntax tree and options
function analyze(tree, providedOptions) {
    const options = updateDeeply(defaultOptions(), providedOptions);
    const scopeManager = new ScopeManager(options);
    const referencer = new Referencer(options, scopeManager);

    referencer.visit(tree);

    assert(scopeManager.__currentScope === null, "currentScope should be null.");
    return scopeManager;
}

module.exports = {
    version,
    Reference,
    Variable,
    Scope,
    ScopeManager,
    analyze
};
