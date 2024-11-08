(function initializeModule(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof exports === 'object') {
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.NW = global.NW || {};
        global.NW.Dom = factory(global, initializeModule);
    }

}(this, function createFactory(global) {
    'use strict';

    const doc = global.document;
    let root = doc.documentElement;

    // Configuration and state management
    const Config = {
        IDS_DUPES: true,
        LOGERRORS: true,
        VERBOSITY: true
    };

    let hasDupes = false;

    const initializeEnvironment = (doc) => {
        setIdentifierSyntax();
        switchContext(doc, true);
    };

    // Setup initial context
    let lastContext;

    const switchContext = function (context, force) {
        const oldDoc = doc;
        const localDoc = context.ownerDocument || context;
        if (force || oldDoc !== localDoc) {
            root = localDoc.documentElement;
            Snapshot.doc = localDoc;
            Snapshot.root = root;
        }
        return (Snapshot.from = context);
    };

    let reOptimizer, reValidator;

    // Regex for parsing
    const setIdentifierSyntax = function () {
        // Define regex patterns for selectors
        const identifier = '-?(?:[a-zA-Z_-]|\\\\.|[0-9]+)*';
        const attributes = `\\[(${identifier})\\s*(?:([~|^$*]?=)\\s*(?:(['\"]?)(.*?)\\3))?\\]`;
        reValidator = new RegExp(`^(${identifier})(?:${attributes})?$`);
        reOptimizer = new RegExp(`[.:#*](${identifier})[^[:]*]`);
    };

    // Core matching methods
    const byId = (id, context) => {
        const element = context.getElementById(id);
        return element ? [element] : [];
    };

    const byTag = (tag, context) => {
        return Array.from(context.getElementsByTagName(tag));
    };

    const byClass = (cls, context) => {
        return Array.from(context.getElementsByClassName(cls));
    };

    // Match elements
    const match = (selectors, element) => {
        if (!element) return false;
        const resolver = compile(selectors, false);
        return resolver(element);
    };

    // Query elements
    const selectAll = (selectors, context) => {
        if (!context) context = doc;
        const resolver = compile(selectors, true);
        return resolver(context);
    };

    // Compile selectors into functions
    const compile = (selector, mode) => {
        const source = compileSelector(selector, mode);
        return new Function('element', source);
    };

    const compileSelector = (selector, mode) => {
        return `return ${mode ? 'true' : 'false'};`; // Simplified logic
    };

    const Snapshot = {
        doc: doc,
        from: doc,
        root: root,
        byTag: byTag,
        match: match,
    };

    const Dom = {
        byId: byId,
        byTag: byTag,
        byClass: byClass,
        match: match,
        selectAll: selectAll,
        configure: (options) => {
            Object.assign(Config, options);
        },
    };

    initializeEnvironment(doc);

    return Dom;
}));
