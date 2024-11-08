"use strict";

const __createBinding = (this && this.__createBinding) || (Object.create
    ? (function(o, m, k, k2) { if (k2 === undefined) k2 = k; Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } }); })
    : (function(o, m, k, k2) { if (k2 === undefined) k2 = k; o[k2] = m[k]; }));

const __setModuleDefault = (this && this.__setModuleDefault) || (Object.create
    ? (function(o, v) { Object.defineProperty(o, "default", { enumerable: true, value: v }); })
    : function(o, v) { o["default"] = v; });

const __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null) for (const k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.pseudos = exports.filters = exports.is = exports.selectOne = exports.selectAll = exports.prepareContext = exports._compileToken = exports._compileUnsafe = exports.compile = void 0;

const DomUtils = __importStar(require("domutils"));
const { falseFunc } = require("boolbase");
const { compile, compileUnsafe, compileToken } = require("./compile");
const { getNextSiblings } = require("./pseudo-selectors/subselects");
const { filters, pseudos } = require("./pseudo-selectors");

const defaultEquals = (a, b) => a === b;

const defaultOptions = {
    adapter: DomUtils,
    equals: defaultEquals,
};

function convertOptionFormats(options) {
    const opts = options || defaultOptions;
    opts.adapter = opts.adapter || DomUtils;
    opts.equals = opts.equals || (opts.adapter?.equals || defaultEquals);
    return opts;
}

function wrapCompile(func) {
    return function addAdapter(selector, options, context) {
        const opts = convertOptionFormats(options);
        return func(selector, opts, context);
    };
}

exports.compile = wrapCompile(compile);
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

function appendNextSiblings(elem, adapter) {
    const elems = Array.isArray(elem) ? elem.slice(0) : [elem];
    elems.forEach(el => {
        const nextSiblings = getNextSiblings(el, adapter);
        elems.push(...nextSiblings);
    });
    return elems;
}

exports.selectAll = getSelectorFunc((query, elems, options) => {
    return query === falseFunc || !elems || elems.length === 0
        ? []
        : options.adapter.findAll(query, elems);
});

exports.selectOne = getSelectorFunc((query, elems, options) => {
    return query === falseFunc || !elems || elems.length === 0
        ? null
        : options.adapter.findOne(query, elems);
});

function is(elem, query, options) {
    const opts = convertOptionFormats(options);
    return (typeof query === "function" ? query : compile(query, opts))(elem);
}

exports.is = is;
exports.default = exports.selectAll;

Object.defineProperty(exports, "filters", { enumerable: true, get: function () { return filters; } });
Object.defineProperty(exports, "pseudos", { enumerable: true, get: function () { return pseudos; } });
