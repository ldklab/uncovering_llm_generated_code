"use strict";

const assert = require("assert");
const ScopeManager = require("./scope-manager");
const Referencer = require("./referencer");
const Reference = require("./reference");
const Variable = require("./variable");
const { Scope } = require("./scope");
const { version } = require("../package.json");

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

function updateDeeply(target, override) {
    const isHashObject = (value) => 
        typeof value === "object" && value !== null && !(value instanceof Array || value instanceof RegExp);

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

function analyze(tree, providedOptions) {
    const options = updateDeeply(defaultOptions(), providedOptions);
    const scopeManager = new ScopeManager(options);
    const referencer = new Referencer(options, scopeManager);

    referencer.visit(tree);

    assert.strictEqual(scopeManager.__currentScope, null, "currentScope should be null.");

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

/* vim: set sw=4 ts=4 et tw=80 : */
