'use strict';

const path = require('path');
const picomatch = require('picomatch');

function addExtension(filename, ext = '.js') {
    return path.extname(filename) ? filename : `${filename}${ext}`;
}

class WalkerBase {
    constructor() {
        this.should_skip = false;
        this.should_remove = false;
        this.replacement = null;
        this.context = {
            skip: () => (this.should_skip = true),
            remove: () => (this.should_remove = true),
            replace: (node) => (this.replacement = node)
        };
    }

    replace(parent, prop, index, node) {
        if (parent) {
            if (index !== null) {
                parent[prop][index] = node;
            } else {
                parent[prop] = node;
            }
        }
    }

    remove(parent, prop, index) {
        if (parent) {
            if (index !== null) {
                parent[prop].splice(index, 1);
            } else {
                delete parent[prop];
            }
        }
    }
}

class SyncWalkerClass extends WalkerBase {
    constructor(walker) {
        super();
        this.enter = walker.enter;
        this.leave = walker.leave;
    }

    visit(node, parent, enter, leave, prop, index) {
        if (node) {
            if (enter) {
                const savedState = {
                    should_skip: this.should_skip,
                    should_remove: this.should_remove,
                    replacement: this.replacement
                };
                this.should_skip = false;
                this.should_remove = false;
                this.replacement = null;

                enter.call(this.context, node, parent, prop, index);

                if (this.replacement) {
                    node = this.replacement;
                    this.replace(parent, prop, index, node);
                }

                if (this.should_remove) {
                    this.remove(parent, prop, index);
                }

                const { should_skip, should_remove } = this;
                Object.assign(this, savedState);

                if (should_skip) return node;
                if (should_remove) return null;
            }

            for (const key in node) {
                const value = node[key];
                if (typeof value === "object" && value !== null) {
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            if (value[i] !== null && typeof value[i].type === 'string') {
                                if (!this.visit(value[i], node, enter, leave, key, i)) {
                                    i--;
                                }
                            }
                        }
                    } else if (typeof value.type === "string") {
                        this.visit(value, node, enter, leave, key, null);
                    }
                }
            }

            if (leave) {
                const savedState = {
                    replacement: this.replacement,
                    should_remove: this.should_remove
                };
                this.replacement = null;
                this.should_remove = false;

                leave.call(this.context, node, parent, prop, index);

                if (this.replacement) {
                    node = this.replacement;
                    this.replace(parent, prop, index, node);
                }

                if (this.should_remove) {
                    this.remove(parent, prop, index);
                }

                const { should_remove } = this;
                Object.assign(this, savedState);

                if (should_remove) return null;
            }
        }

        return node;
    }
}

function walk(ast, walker) {
    const instance = new SyncWalkerClass(walker);
    return instance.visit(ast, null, walker.enter, walker.leave);
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

const blockDeclarations = { const: true, let: true };

class Scope {
    constructor(options = {}) {
        this.parent = options.parent;
        this.isBlockScope = !!options.block;
        this.declarations = Object.create(null);
        if (options.params) {
            options.params.forEach(param =>
                extractAssignedNames(param).forEach(name => {
                    this.declarations[name] = true;
                })
            );
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
        return this.declarations[name] || (this.parent && this.parent.contains(name));
    }
}

function attachScopes(ast, propertyName = 'scope') {
    let scope = new Scope();
    walk(ast, {
        enter(node, parent) {
            if (/(Function|Class)Declaration/.test(node.type)) {
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
                const func = node;
                newScope = new Scope({
                    parent: scope,
                    block: false,
                    params: func.params,
                });
                if (func.type === 'FunctionExpression' && func.id) {
                    newScope.addDeclaration(func, false, false);
                }
            }
            if (/For(In|Of)?Statement/.test(node.type)) {
                newScope = new Scope({
                    parent: scope,
                    block: true,
                });
            }
            if (node.type === 'BlockStatement' && !/Function/.test(parent.type)) {
                newScope = new Scope({
                    parent: scope,
                    block: true,
                });
            }
            if (node.type === 'CatchClause') {
                newScope = new Scope({
                    parent: scope,
                    params: node.param ? [node.param] : [],
                    block: true,
                });
            }
            if (newScope) {
                Object.defineProperty(node, propertyName, {
                    value: newScope,
                    configurable: true,
                });
                scope = newScope;
            }
        },
        leave(node) {
            if (node[propertyName]) {
                scope = scope.parent;
            }
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

function normalizePath(filename) {
    return filename.split(path.win32.sep).join(path.posix.sep);
}

function getMatcherString(id, resolutionBase) {
    if (resolutionBase === false || path.isAbsolute(id) || id.startsWith('*')) {
        return id;
    }
    const basePath = normalizePath(path.resolve(resolutionBase || ''))
        .replace(/[-^$*+?.()|[\]{}]/g, '\\$&');
    return path.posix.join(basePath, id);
}

function createFilter(include, exclude, options) {
    const resolutionBase = options && options.resolve;
    const getMatcher = (id) => id instanceof RegExp
        ? id
        : {
            test: (what) => {
                const pattern = getMatcherString(id, resolutionBase);
                const fn = picomatch(pattern, { dot: true });
                return fn(what);
            }
        };
    const includeMatchers = ensureArray(include).map(getMatcher);
    const excludeMatchers = ensureArray(exclude).map(getMatcher);
    return function result(id) {
        if (typeof id !== 'string' || /\0/.test(id)) return false;
        const pathId = normalizePath(id);
        for (const matcher of excludeMatchers) {
            if (matcher.test(pathId)) return false;
        }
        for (const matcher of includeMatchers) {
            if (matcher.test(pathId)) return true;
        }
        return includeMatchers.length === 0;
    };
}

const reservedWords = new Set('break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public'.split(' '));
const builtins = new Set('arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl'.split(' '));
const forbiddenIdentifiers = new Set([...reservedWords, ...builtins, '']);

function makeLegalIdentifier(str) {
    let identifier = str
        .replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
        .replace(/[^$_a-zA-Z0-9]/g, '_');
    if (/\d/.test(identifier[0]) || forbiddenIdentifiers.has(identifier)) {
        identifier = `_${identifier}`;
    }
    return identifier || '_';
}

function stringify(obj) {
    return (JSON.stringify(obj) || 'undefined').replace(/[\u2028\u2029]/g, char => `\\u${`000${char.charCodeAt(0).toString(16)}`.slice(-4)}`);
}

function serializeArray(arr, indent, baseIndent) {
    const separator = indent ? `\n${baseIndent}${indent}` : '';
    return `[${arr.map((key, i) => {
        const serialized = serialize(key, indent, baseIndent + indent);
        return `${i > 0 ? ',' : ''}${separator}${serialized}`;
    }).join('')}${indent ? `\n${baseIndent}` : ''}]`;
}

function serializeObject(obj, indent, baseIndent) {
    const separator = indent ? `\n${baseIndent}${indent}` : '';
    const entries = Object.entries(obj).map(([key, value], i) => {
        const stringKey = makeLegalIdentifier(key) === key ? key : stringify(key);
        const serializedValue = serialize(value, indent, baseIndent + indent);
        return `${i > 0 ? ',' : ''}${separator}${stringKey}:${indent ? ' ' : ''}${serializedValue}`;
    });
    return `{${entries.join('')}${indent ? `\n${baseIndent}` : ''}}`;
}

function serialize(obj, indent, baseIndent) {
    if (obj === Infinity) return 'Infinity';
    if (obj === -Infinity) return '-Infinity';
    if (obj === 0 && 1 / obj === -Infinity) return '-0';
    if (obj instanceof Date) return `new Date(${obj.getTime()})`;
    if (obj instanceof RegExp) return obj.toString();
    if (obj !== obj) return 'NaN'; // eslint-disable-line no-self-compare
    if (Array.isArray(obj)) return serializeArray(obj, indent, baseIndent);
    if (obj === null) return 'null';
    if (typeof obj === 'object') return serializeObject(obj, indent, baseIndent);
    return stringify(obj);
}

function dataToEsm(data, options = {}) {
    const t = options.compact ? '' : 'indent' in options ? options.indent : '\t';
    const _ = options.compact ? '' : ' ';
    const n = options.compact ? '' : '\n';
    const declarationType = options.preferConst ? 'const' : 'var';
    if (options.namedExports === false || typeof data !== 'object' || Array.isArray(data) || data instanceof Date || data instanceof RegExp || data === null) {
        const code = serialize(data, options.compact ? null : t, '');
        const magic = _ || (/^[{[\-\/]/.test(code) ? '' : ' '); // eslint-disable-line no-useless-escape
        return `export default${magic}${code};`;
    }
    let namedExportCode = '';
    const defaultExportRows = [];
    for (const [key, value] of Object.entries(data)) {
        if (key === makeLegalIdentifier(key)) {
            if (options.objectShorthand) defaultExportRows.push(key);
            else defaultExportRows.push(`${key}:${_}${key}`);
            namedExportCode += `export ${declarationType} ${key}${_}=${_}${serialize(value, options.compact ? null : t, '')};${n}`;
        } else {
            defaultExportRows.push(`${stringify(key)}:${_}${serialize(value, options.compact ? null : t, '')}`);
        }
    }
    return `${namedExportCode}export default${_}{${n}${t}${defaultExportRows.join(`,${n}${t}`)}${n}};${n}`;
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