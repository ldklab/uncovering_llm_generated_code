'use strict';

const path = require('path');
const estreeWalker = require('estree-walker');
const pm = require('picomatch');

function addExtension(filename, ext = '.js') {
    return path.extname(filename) ? filename : filename + ext;
}

const extractors = {
    ArrayPattern(names, param) {
        for (const element of param.elements) {
            if (element) extractors[element.type](names, element);
        }
    },
    AssignmentPattern(names, param) {
        extractors[param.left.type](names, param.left);
    },
    Identifier(names, param) {
        names.push(param.name);
    },
    MemberExpression() {},
    ObjectPattern(names, param) {
        for (const prop of param.properties) {
            if (prop.type === 'RestElement') {
                extractors.RestElement(names, prop);
            } else {
                extractors[prop.value.type](names, prop.value);
            }
        }
    },
    RestElement(names, param) {
        extractors[param.argument.type](names, param.argument);
    }
};

function extractAssignedNames(param) {
    const names = [];
    extractors[param.type](names, param);
    return names;
}

const blockDeclarations = {
    const: true,
    let: true
};

class Scope {
    constructor(options = {}) {
        this.parent = options.parent;
        this.isBlockScope = !!options.block;
        this.declarations = Object.create(null);
        if (options.params) {
            options.params.forEach(param => {
                extractAssignedNames(param).forEach(name => {
                    this.declarations[name] = true;
                });
            });
        }
    }

    addDeclaration(node, isBlockDeclaration, isVar) {
        if (!isBlockDeclaration && this.isBlockScope) {
            this.parent.addDeclaration(node, isBlockDeclaration, isVar);
        } else if (node.id) {
            extractAssignedNames(node.id).forEach(name => {
                this.declarations[name] = true;
            });
        }
    }

    contains(name) {
        return this.declarations[name] || (this.parent ? this.parent.contains(name) : false);
    }
}

function attachScopes(ast, propertyName = 'scope') {
    let scope = new Scope();
    estreeWalker.walk(ast, {
        enter(n, parent) {
            const node = n;
            if (/(?:Function|Class)Declaration/.test(node.type)) {
                scope.addDeclaration(node, false, false);
            }

            if (node.type === 'VariableDeclaration') {
                const { kind } = node;
                node.declarations.forEach(declaration => {
                    scope.addDeclaration(declaration, blockDeclarations[kind], true);
                });
            }

            let newScope;
            if (/Function/.test(node.type)) {
                newScope = new Scope({
                    parent: scope,
                    block: false,
                    params: node.params
                });
                if (node.type === 'FunctionExpression' && node.id) {
                    newScope.addDeclaration(node, false, false);
                }
            }

            if (/For(?:In|Of)?Statement/.test(node.type)) {
                newScope = new Scope({ parent: scope, block: true });
            }

            if (node.type === 'BlockStatement' && !/Function/.test(parent.type)) {
                newScope = new Scope({ parent: scope, block: true });
            }

            if (node.type === 'CatchClause') {
                newScope = new Scope({ parent: scope, params: node.param ? [node.param] : [], block: true });
            }

            if (newScope) {
                Object.defineProperty(node, propertyName, {
                    value: newScope,
                    configurable: true
                });
                scope = newScope;
            }
        },
        leave(n) {
            const node = n;
            if (node[propertyName]) scope = scope.parent;
        }
    });
    return scope;
}

function isArray(arg) {
    return Array.isArray(arg);
}

function ensureArray(thing) {
    if (isArray(thing)) return thing;
    if (thing == null) return [];
    return [thing];
}

const normalizePathRegExp = new RegExp(`\\${path.win32.sep}`, 'g');

function normalizePath(filename) {
    return filename.replace(normalizePathRegExp, path.posix.sep);
}

function getMatcherString(id, resolutionBase) {
    if (resolutionBase === false || path.isAbsolute(id) || id.startsWith('**')) {
        return normalizePath(id);
    }

    const basePath = normalizePath(path.resolve(resolutionBase || '')).replace(/[-^$*+?.()|[\]{}]/g, '\\$&');
    return path.posix.join(basePath, normalizePath(id));
}

function createFilter(include, exclude, options) {
    const resolutionBase = options && options.resolve;
    const getMatcher = id => id instanceof RegExp ? id : { test: what => pm(getMatcherString(id, resolutionBase), { dot: true })(what) };

    const includeMatchers = ensureArray(include).map(getMatcher);
    const excludeMatchers = ensureArray(exclude).map(getMatcher);

    return function result(id) {
        if (typeof id !== 'string' || id.includes('\0')) return false;
        const pathId = normalizePath(id);
        for (const matcher of excludeMatchers) {
            if (matcher.test(pathId)) return false;
        }
        for (const matcher of includeMatchers) {
            if (matcher.test(pathId)) return true;
        }
        return !includeMatchers.length;
    };
}

const reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public';
const builtins = 'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl';
const forbiddenIdentifiers = new Set(`${reservedWords} ${builtins}`.split(' '));
forbiddenIdentifiers.add('');

function makeLegalIdentifier(str) {
    let identifier = str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(/[^$_a-zA-Z0-9]/g, '_');
    if (/\d/.test(identifier[0]) || forbiddenIdentifiers.has(identifier)) {
        identifier = `_${identifier}`;
    }
    return identifier || '_';
}

function stringify(obj) {
    return (JSON.stringify(obj) || 'undefined').replace(/[\u2028\u2029]/g, char => `\\u${(`000${char.charCodeAt(0).toString(16)}`).slice(-4)}`);
}

function serializeArray(arr, indent, baseIndent) {
    let output = '[';
    const separator = indent ? `\n${baseIndent}${indent}` : '';
    for (let i = 0; i < arr.length; i++) {
        output += `${i > 0 ? ',' : ''}${separator}${serialize(arr[i], indent, baseIndent + indent)}`;
    }
    return `${output}${indent ? `\n${baseIndent}` : ''}]`;
}

function serializeObject(obj, indent, baseIndent) {
    let output = '{';
    const separator = indent ? `\n${baseIndent}${indent}` : '';
    const entries = Object.entries(obj);
    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const stringKey = makeLegalIdentifier(key) === key ? key : stringify(key);
        output += `${i > 0 ? ',' : ''}${separator}${stringKey}:${indent ? ' ' : ''}${serialize(value, indent, baseIndent + indent)}`;
    }
    return `${output}${indent ? `\n${baseIndent}` : ''}}`;
}

function serialize(obj, indent, baseIndent) {
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

const hasStringIsWellFormed = 'isWellFormed' in String.prototype;

function isWellFormedString(input) {
    if (hasStringIsWellFormed) return input.isWellFormed();
    return !/\p{Surrogate}/u.test(input);
}

function dataToEsm(data, options = {}) {
    const t = options.compact ? '' : 'indent' in options ? options.indent : '\t';
    const _ = options.compact ? '' : ' ';
    const n = options.compact ? '' : '\n';
    const declarationType = options.preferConst ? 'const' : 'var';
    if (options.namedExports === false || typeof data !== 'object' || Array.isArray(data) || data instanceof Date || data instanceof RegExp || data === null) {
        const code = serialize(data, options.compact ? null : t, '');
        const magic = _ || (/^[{[\-\/]/.test(code) ? '' : ' ');
        return `export default${magic}${code};`;
    }
    let maxUnderbarPrefixLength = 0;
    for (const key of Object.keys(data)) {
        const underbarPrefixLength = /^(_+)/.exec(key)?.[0].length ?? 0;
        if (underbarPrefixLength > maxUnderbarPrefixLength) {
            maxUnderbarPrefixLength = underbarPrefixLength;
        }
    }
    const arbitraryNamePrefix = '_'.repeat(maxUnderbarPrefixLength + 1) + 'arbitrary';
    let namedExportCode = '';
    const defaultExportRows = [];
    const arbitraryNameExportRows = [];
    for (const [key, value] of Object.entries(data)) {
        if (key === makeLegalIdentifier(key)) {
            if (options.objectShorthand) defaultExportRows.push(key);
            else defaultExportRows.push(`${key}:${_}${key}`);
            namedExportCode += `export ${declarationType} ${key}${_}=${_}${serialize(value, options.compact ? null : t, '')};${n}`;
        } else {
            defaultExportRows.push(`${stringify(key)}:${_}${serialize(value, options.compact ? null : t, '')}`);
            if (options.includeArbitraryNames && isWellFormedString(key)) {
                const variableName = `${arbitraryNamePrefix}${arbitraryNameExportRows.length}`;
                namedExportCode += `${declarationType} ${variableName}${_}=${_}${serialize(value, options.compact ? null : t, '')};${n}`;
                arbitraryNameExportRows.push(`${variableName} as ${JSON.stringify(key)}`);
            }
        }
    }
    const arbitraryExportCode = arbitraryNameExportRows.length > 0 ? `export${_}{${n}${t}${arbitraryNameExportRows.join(`,${n}${t}`)}${n}};${n}` : '';
    const defaultExportCode = `export default${_}{${n}${t}${defaultExportRows.join(`,${n}${t}`)}${n}};${n}`;
    return `${namedExportCode}${arbitraryExportCode}${defaultExportCode}`;
}

const index = {
    addExtension,
    attachScopes,
    createFilter,
    dataToEsm,
    extractAssignedNames,
    makeLegalIdentifier,
    normalizePath
};

module.exports = { ...index };
