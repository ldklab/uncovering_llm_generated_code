"use strict";

const DomUtils = require("domutils");
const boolbase = require("boolbase").default;
const { compile, compileUnsafe, compileToken } = require("./compile.js");
const { getNextSiblings } = require("./pseudo-selectors/subselects.js");
const { filters, pseudos, aliases } = require("./pseudo-selectors/index.js");

const defaultEquals = (a, b) => a === b;
const defaultOptions = {
    adapter: DomUtils,
    equals: defaultEquals,
};

function convertOptionFormats(options) {
    let opts = options ?? defaultOptions;
    opts.adapter = opts.adapter ?? DomUtils;
    opts.equals = opts.equals ?? (opts.adapter?.equals ?? defaultEquals);
    return opts;
}

function wrapCompile(func) {
    return function (selector, options, context) {
        const opts = convertOptionFormats(options);
        return func(selector, opts, context);
    };
}

const compileWrapped = wrapCompile(compile);
const compileUnsafeWrapped = wrapCompile(compileUnsafe);
const compileTokenWrapped = wrapCompile(compileToken);

function getSelectorFunc(searchFunc) {
    return function (query, elements, options) {
        const opts = convertOptionFormats(options);
        if (typeof query !== "function") {
            query = compileUnsafeWrapped(query, opts, elements);
        }
        const filteredElements = prepareContext(elements, opts.adapter, query.shouldTestNextSiblings);
        return searchFunc(query, filteredElements, opts);
    };
}

function prepareContext(elems, adapter, shouldTestNextSiblings = false) {
    if (shouldTestNextSiblings) {
        elems = appendNextSiblings(elems, adapter);
    }
    return Array.isArray(elems) ? adapter.removeSubsets(elems) : adapter.getChildren(elems);
}

function appendNextSiblings(elem, adapter) {
    const elems = Array.isArray(elem) ? elem.slice() : [elem];
    for (const el of elems) {
        elems.push(...getNextSiblings(el, adapter));
    }
    return elems;
}

const selectAll = getSelectorFunc((query, elems, options) => {
    return query === boolbase.falseFunc || !elems?.length ? [] : options.adapter.findAll(query, elems);
});

const selectOne = getSelectorFunc((query, elems, options) => {
    return query === boolbase.falseFunc || !elems?.length ? null : options.adapter.findOne(query, elems);
});

function isMatch(elem, query, options) {
    const opts = convertOptionFormats(options);
    return (typeof query === "function" ? query : compileWrapped(query, opts))(elem);
}

module.exports = {
    compile: compileWrapped,
    _compileUnsafe: compileUnsafeWrapped,
    _compileToken: compileTokenWrapped,
    prepareContext,
    selectAll,
    selectOne,
    is: isMatch,
    aliases,
    pseudos,
    filters,
    default: selectAll
};
