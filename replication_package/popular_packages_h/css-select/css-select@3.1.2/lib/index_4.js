"use strict";
const { compile, compileUnsafe, compileToken } = require("./compile");
const { getNextSiblings } = require("./pseudo-selectors/subselects");
const DomUtils = require("domutils");
const { falseFunc } = require("boolbase");
const { filters, pseudos } = require("./pseudo-selectors");

const defaultEquals = (a, b) => a === b;
const defaultOptions = {
    adapter: DomUtils,
    equals: defaultEquals,
};

function convertOptionFormats(options) {
    const opts = options || { ...defaultOptions };
    opts.adapter = opts.adapter || DomUtils;
    opts.equals = opts.equals || (opts.adapter.equals || defaultEquals);
    return opts;
}

function wrapCompile(func) {
    return function (selector, options, context) {
        const opts = convertOptionFormats(options);
        return func(selector, opts, context);
    };
}

exports.compile = wrapCompile(compile);
exports._compileUnsafe = wrapCompile(compileUnsafe);
exports._compileToken = wrapCompile(compileToken);

function getSelectorFunc(searchFunc) {
    return function (query, elements, options) {
        const opts = convertOptionFormats(options);
        if (typeof query !== "function") {
            query = compileUnsafe(query, opts, elements);
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
    for (let i = 0; i < elems.length; i++) {
        elems.push(...getNextSiblings(elems[i], adapter));
    }
    return elems;
}

exports.selectAll = getSelectorFunc((query, elems, options) => {
    return query === falseFunc || !elems || elems.length === 0 ? [] : options.adapter.findAll(query, elems);
});

exports.selectOne = getSelectorFunc((query, elems, options) => {
    return query === falseFunc || !elems || elems.length === 0 ? null : options.adapter.findOne(query, elems);
});

function is(elem, query, options) {
    const opts = convertOptionFormats(options);
    return (typeof query === "function" ? query : compile(query, opts))(elem);
}

exports.is = is;
exports.prepareContext = prepareContext;
exports.default = exports.selectAll;
exports.filters = filters;
exports.pseudos = pseudos;
