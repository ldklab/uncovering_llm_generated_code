"use strict";

const { default: boolbase } = require("boolbase");
const DomUtils = require("domutils");
const { compile: compileFunc, compileUnsafe, compileToken } = require("./compile.js");
const { getNextSiblings } = require("./pseudo-selectors/subselects.js");
const { filters, pseudos, aliases } = require("./pseudo-selectors/index.js");

const defaultEquals = (a, b) => a === b;

const defaultOptions = {
    adapter: DomUtils,
    equals: defaultEquals,
};

function convertOptionFormats(options) {
    const opts = options || defaultOptions;
    opts.adapter ||= DomUtils;
    opts.equals ||= opts.adapter?.equals || defaultEquals;
    return opts;
}

function wrapCompile(func) {
    return function addAdapter(selector, options, context) {
        const opts = convertOptionFormats(options);
        return func(selector, opts, context);
    };
}

exports.compile = wrapCompile(compileFunc);
exports._compileUnsafe = wrapCompile(compileUnsafe);
exports._compileToken = wrapCompile(compileToken);

function getSelectorFunc(searchFunc) {
    return function select(query, elements, options) {
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

exports.prepareContext = prepareContext;

function appendNextSiblings(elem, adapter) {
    const elems = Array.isArray(elem) ? elem.slice() : [elem];
    for (let i = 0, len = elems.length; i < len; i++) {
        const nextSiblings = getNextSiblings(elems[i], adapter);
        elems.push(...nextSiblings);
    }
    return elems;
}

exports.selectAll = getSelectorFunc((query, elems, options) =>
    query === boolbase.falseFunc || !elems || elems.length === 0
        ? []
        : options.adapter.findAll(query, elems)
);

exports.selectOne = getSelectorFunc((query, elems, options) =>
    query === boolbase.falseFunc || !elems || elems.length === 0
        ? null
        : options.adapter.findOne(query, elems)
);

function is(elem, query, options) {
    const opts = convertOptionFormats(options);
    return (typeof query === "function" ? query : compileFunc(query, opts))(elem);
}

exports.is = is;
exports.default = exports.selectAll;

Object.defineProperty(exports, "filters", { enumerable: true, get: () => filters });
Object.defineProperty(exports, "pseudos", { enumerable: true, get: () => pseudos });
Object.defineProperty(exports, "aliases", { enumerable: true, get: () => aliases });
