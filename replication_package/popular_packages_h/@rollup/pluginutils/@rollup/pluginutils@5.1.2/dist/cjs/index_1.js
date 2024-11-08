'use strict';

const path = require('path');
const estreeWalker = require('estree-walker');
const pm = require('picomatch');

function addExtension(filename, ext = '.js') {
    return !path.extname(filename) ? `${filename}${ext}` : filename;
}

const extractors = {
    ArrayPattern(names, param) { param.elements.forEach(e => e && extractors[e.type](names, e)); },
    AssignmentPattern(names, param) { extractors[param.left.type](names, param.left); },
    Identifier(names, param) { names.push(param.name); },
    MemberExpression() { },
    ObjectPattern(names, param) {
        param.properties.forEach(prop => {
            const type = prop.type === 'RestElement' ? 'RestElement' : prop.value.type;
            extractors[type](names, prop.value || prop);
        });
    },
    RestElement(names, param) { extractors[param.argument.type](names, param.argument); }
};

function extractAssignedNames(param) {
    const names = [];
    extractors[param.type](names, param);
    return names;
}

const blockDeclarations = { const: true, let: true };

class Scope {
    constructor({ parent = null, block = false, params = [] } = {}) {
        this.parent = parent;
        this.isBlockScope = block;
        this.declarations = Object.create(null);
        params.forEach(param => extractAssignedNames(param).forEach(name => this.declarations[name] = true));
    }

    addDeclaration(node, isBlockDeclaration) {
        if (!isBlockDeclaration && this.isBlockScope) this.parent.addDeclaration(node, isBlockDeclaration);
        else if (node.id) extractAssignedNames(node.id).forEach(name => this.declarations[name] = true);
    }

    contains(name) {
        return this.declarations[name] || (this.parent && this.parent.contains(name));
    }
}

function attachScopes(ast, propertyName = 'scope') {
    let scope = new Scope();
    estreeWalker.walk(ast, {
        enter(node) {
            if (/^(?:Function|Class)Declaration$/.test(node.type)) scope.addDeclaration(node, false);
            if (node.type === 'VariableDeclaration') {
                node.declarations.forEach(declaration => scope.addDeclaration(declaration, blockDeclarations[node.kind]));
            }
            let newScope = null;
            if (/^Function/.test(node.type)) newScope = new Scope({ parent: scope, params: node.params });
            if (/^For(?:In|Of)?Statement$/.test(node.type) || (node.type === 'BlockStatement' && !/Function/.test(node.parent?.type)))
                newScope = new Scope({ parent: scope, block: true });
            if (node.type === 'CatchClause') newScope = new Scope({ parent: scope, block: true, params: [node.param] });

            if (newScope) {
                Object.defineProperty(node, propertyName, { value: newScope, configurable: true });
                scope = newScope;
            }
        },
        leave(node) {
            if (node[propertyName]) scope = scope.parent;
        }
    });
    return scope;
}

function normalizePath(filename) {
    return filename.replace(new RegExp(`\\${path.win32.sep}`, 'g'), path.posix.sep);
}

function createFilter(include, exclude, options = {}) {
    const getMatcher = id => id instanceof RegExp ? id : { test: what => pm(getMatcherString(id, options.resolve), { dot: true })(what) };
    const includeMatchers = ensureArray(include).map(getMatcher);
    const excludeMatchers = ensureArray(exclude).map(getMatcher);

    return (id) => {
        if (typeof id !== 'string' || id.includes('\0')) return false;
        const pathId = normalizePath(id);
        if (excludeMatchers.some(m => m.test(pathId))) return false;
        if (includeMatchers.some(m => m.test(pathId))) return true;
        return !includeMatchers.length;
    };
}

const reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public';
const builtins = 'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl';
const forbiddenIdentifiers = new Set(`${reservedWords} ${builtins}`.split(' '));
forbiddenIdentifiers.add('');

function makeLegalIdentifier(str) {
    let identifier = str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(/[^$_a-zA-Z0-9]/g, '_');
    if (/\d/.test(identifier[0]) || forbiddenIdentifiers.has(identifier)) identifier = `_${identifier}`;
    return identifier || '_';
}

function stringify(obj) {
    return (JSON.stringify(obj) || 'undefined').replace(/[\u2028\u2029]/g, char => `\\u${`000${char.charCodeAt(0).toString(16)}`.slice(-4)}`);
}

function serialize(obj, indent = '', baseIndent = '') {
    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) return serializeArray(obj, indent, baseIndent);
        if (obj instanceof Date) return `new Date(${obj.getTime()})`;
        if (obj instanceof RegExp) return obj.toString();
        return serializeObject(obj, indent, baseIndent);
    }
    if (typeof obj === 'number') {
        if (obj === Infinity) return 'Infinity';
        if (obj === -Infinity) return '-Infinity';
        if (obj === 0) return 1 / obj === Infinity ? '0' : '-0';
        if (obj !== obj) return 'NaN';
    }
    if (typeof obj === 'symbol') {
        const key = Symbol.keyFor(obj);
        if (key !== undefined) return `Symbol.for(${stringify(key)})`;
    }
    if (typeof obj === 'bigint') return `${obj}n`;
    return stringify(obj);
}

function serializeArray(arr, indent, baseIndent = '') {
    const separator = indent ? `\n${baseIndent}${indent}` : '';
    const content = arr.map((el, i) => `${i > 0 ? ',' : ''}${separator}${serialize(el, indent, baseIndent + indent)}`).join('');
    return `[${content}${indent ? `\n${baseIndent}` : ''}]`;
}

function serializeObject(obj, indent, baseIndent = '') {
    const separator = indent ? `\n${baseIndent}${indent}` : '';
    const content = Object.entries(obj).map(([key, value], i) => {
        const stringKey = makeLegalIdentifier(key) === key ? key : stringify(key);
        return `${i > 0 ? ',' : ''}${separator}${stringKey}:${indent ? ' ' : ''}${serialize(value, indent, baseIndent + indent)}`;
    }).join('');
    return `{${content}${indent ? `\n${baseIndent}` : ''}}`;
}

function isWellFormedString(input) {
    if ('isWellFormed' in String.prototype) return input.isWellFormed();
    return !/\p{Surrogate}/u.test(input);
}

function dataToEsm(data, options = {}) {
    const t = options.compact ? '' : 'indent' in options ? options.indent : '\t';
    const _ = options.compact ? '' : ' ';
    const n = options.compact ? '' : '\n';
    const declarationType = options.preferConst ? 'const' : 'var';

    if (typeof data !== 'object' || Array.isArray(data) || data instanceof Date || data instanceof RegExp || data === null) {
        const serializedData = serialize(data, options.compact ? null : t, '');
        return `export default${_}${serializedData};`;
    }

    let namedExportCode = '';
    const defaultExportRows = [];
    for (const [key, value] of Object.entries(data)) {
        const name = makeLegalIdentifier(key);
        if (name === key) {
            defaultExportRows.push(options.objectShorthand ? key : `${key}:${_}${key}`);
            namedExportCode += `export ${declarationType} ${key}${_}=${_}${serialize(value, options.compact ? null : t, '')};${n}`;
        } else {
            defaultExportRows.push(`${stringify(key)}:${_}${serialize(value, options.compact ? null : t, '')}`);
            if (options.includeArbitraryNames && isWellFormedString(key)) {
                const varName = `_arbitrary${key.replace(/[^$_a-zA-Z0-9]/g, '_')}`;
                namedExportCode += `export ${declarationType} ${varName}${_}=${_}${serialize(value, options.compact ? null : t, '')};${n}`;
            }
        }
    }

    return `${namedExportCode}${defaultExportRows.length ? `export default${_}{${n}${t}${defaultExportRows.join(`,${n}${t}`)}${n}};${n}` : ''}`;
}

// Utility functions
function isArray(arg) {
    return Array.isArray(arg);
}

function ensureArray(thing) {
    if (isArray(thing)) return thing;
    return thing == null ? [] : [thing];
}

function getMatcherString(id, base) {
    if (base === false || path.isAbsolute(id) || id.startsWith('**')) return normalizePath(id);
    const basePath = normalizePath(path.resolve(base || '')).replace(/[-^$*+?.()|[\]{}]/g, '\\$&');
    return path.posix.join(basePath, normalizePath(id));
}

module.exports = {
    addExtension,
    attachScopes,
    createFilter,
    dataToEsm,
    extractAssignedNames,
    makeLegalIdentifier,
    normalizePath
};
