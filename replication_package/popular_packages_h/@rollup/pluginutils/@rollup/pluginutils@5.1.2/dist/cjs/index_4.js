'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const path = require('path');
const estreeWalker = require('estree-walker');
const pm = require('picomatch');

const addExtension = (filename, ext = '.js') => {
    return path.extname(filename) ? filename : `${filename}${ext}`;
};

const extractors = {
    ArrayPattern(names, param) {
        param.elements.forEach(element => {
            if (element) extractors[element.type](names, element);
        });
    },
    AssignmentPattern(names, param) {
        extractors[param.left.type](names, param.left);
    },
    Identifier(names, param) {
        names.push(param.name);
    },
    MemberExpression() { },
    ObjectPattern(names, param) {
        param.properties.forEach(prop => {
            if (prop.type === 'RestElement') {
                extractors.RestElement(names, prop);
            } else {
                extractors[prop.value.type](names, prop.value);
            }
        });
    },
    RestElement(names, param) {
        extractors[param.argument.type](names, param.argument);
    }
};

const extractAssignedNames = param => {
    const names = [];
    extractors[param.type](names, param);
    return names;
};

const blockDeclarations = { const: true, let: true };

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

const attachScopes = (ast, propertyName = 'scope') => {
    let scope = new Scope();
    estreeWalker.walk(ast, {
        enter(node, parent) {
            if (/Function|ClassDeclaration/.test(node.type)) {
                scope.addDeclaration(node, false, false);
            }
            if (node.type === 'VariableDeclaration') {
                const { kind } = node;
                const isBlockDeclaration = blockDeclarations[kind];
                node.declarations.forEach(declaration => {
                    scope.addDeclaration(declaration, isBlockDeclaration, true);
                });
            }
            let newScope;
            if (/Function/.test(node.type)) {
                newScope = new Scope({ parent: scope, block: false, params: node.params });
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
        leave(node) {
            if (node[propertyName]) scope = scope.parent;
        }
    });
    return scope;
};

const isArray = Array.isArray;

const ensureArray = thing => {
    return isArray(thing) ? thing : (thing == null ? [] : [thing]);
};

const normalizePath = filename => {
    return filename.replace(new RegExp(`\\${path.win32.sep}`, 'g'), path.posix.sep);
};

function getMatcherString(id, resolutionBase) {
    if (resolutionBase === false || path.isAbsolute(id) || id.startsWith('**')) {
        return normalizePath(id);
    }
    const basePath = normalizePath(path.resolve(resolutionBase || '')).replace(/[-^$*+?.()|[\]{}]/g, '\\$&');
    return path.posix.join(basePath, normalizePath(id));
}

const createFilter = (include, exclude, options) => {
    const resolutionBase = options && options.resolve;
    const getMatcher = id => id instanceof RegExp ? id : {
        test: what => pm(getMatcherString(id, resolutionBase), { dot: true })(what)
    };

    const includeMatchers = ensureArray(include).map(getMatcher);
    const excludeMatchers = ensureArray(exclude).map(getMatcher);

    if (!includeMatchers.length && !excludeMatchers.length)
        return id => typeof id === 'string' && !id.includes('\0');

    return function result(id) {
        if (typeof id !== 'string' || id.includes('\0')) return false;
        const pathId = normalizePath(id);
        for (let matcher of excludeMatchers) if (matcher.test(pathId)) return false;
        for (let matcher of includeMatchers) if (matcher.test(pathId)) return true;
        return !includeMatchers.length;
    };
};

const reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public';
const builtins = 'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl';
const forbiddenIdentifiers = new Set((reservedWords + ' ' + builtins).split(' '));
forbiddenIdentifiers.add('');

const makeLegalIdentifier = str => {
    let identifier = str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(/[^$_a-zA-Z0-9]/g, '_');
    if (/\d/.test(identifier[0]) || forbiddenIdentifiers.has(identifier)) {
        identifier = `_${identifier}`;
    }
    return identifier || '_';
};

const stringify = obj => {
    return (JSON.stringify(obj) || 'undefined').replace(/[\u2028\u2029]/g, char => `\\u${(`000${char.charCodeAt(0).toString(16)}`).slice(-4)}`);
};

function serializeArray(arr, indent, baseIndent) {
    return `[${arr.map((item, i) => `${i > 0 ? ',' : ''}${indent ? `\n${baseIndent}${indent}` : ''}${serialize(item, indent, baseIndent + indent)}`).join('')}${indent ? `\n${baseIndent}` : ''}]`;
}

function serializeObject(obj, indent, baseIndent) {
    const entries = Object.entries(obj);
    return `{${entries.map(([key, value], i) => {
        const stringKey = makeLegalIdentifier(key) === key ? key : stringify(key);
        return `${i > 0 ? ',' : ''}${indent ? `\n${baseIndent}${indent}` : ''}${stringKey}:${indent ? ' ' : ''}${serialize(value, indent, baseIndent + indent)}`;
    }).join('')}${indent ? `\n${baseIndent}` : ''}}`;
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

const dataToEsm = (data, options = {}) => {
    const t = options.compact ? '' : options.indent || '\t';
    const _ = options.compact ? '' : ' ';
    const n = options.compact ? '' : '\n';
    const declarationType = options.preferConst ? 'const' : 'var';

    if (options.namedExports === false || typeof data !== 'object' || data === null ||
        Array.isArray(data) || data instanceof Date || data instanceof RegExp) {

        const code = serialize(data, options.compact ? null : t, '');
        const magic = _ || (/^[{[\-\/]/.test(code) ? '' : ' ');
        return `export default${magic}${code};`;
    }

    let maxUnderbarPrefixLength = 0;
    Object.keys(data).forEach(key => {
        const underbarPrefixLength = (key.match(/^(_+)/) || ['', 0])[0].length;
        if (underbarPrefixLength > maxUnderbarPrefixLength) {
            maxUnderbarPrefixLength = underbarPrefixLength;
        }
    });

    const arbitraryNamePrefix = `${'_'.repeat(maxUnderbarPrefixLength + 1)}arbitrary`;
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

    const arbitraryExportCode = arbitraryNameExportRows.length > 0
        ? `export${_}{${n}${t}${arbitraryNameExportRows.join(`,${n}${t}`)}${n}};${n}`
        : '';
    const defaultExportCode = `export default${_}{${n}${t}${defaultExportRows.join(`,${n}${t}`)}${n}};${n}`;

    return `${namedExportCode}${arbitraryExportCode}${defaultExportCode}`;
};

// TODO: remove this in next major
const index = {
    addExtension,
    attachScopes,
    createFilter,
    dataToEsm,
    extractAssignedNames,
    makeLegalIdentifier,
    normalizePath
};

exports.addExtension = addExtension;
exports.attachScopes = attachScopes;
exports.createFilter = createFilter;
exports.dataToEsm = dataToEsm;
exports.default = index;
exports.extractAssignedNames = extractAssignedNames;
exports.makeLegalIdentifier = makeLegalIdentifier;
exports.normalizePath = normalizePath;
module.exports = Object.assign(exports.default, exports);
