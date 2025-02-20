'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const path = require('path');
const pm = require('picomatch');

function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : { 'default': e };
}

const pm__default = /*#__PURE__*/ _interopDefaultLegacy(pm);

// Function to add an extension to a filename if it doesn't already have one
const addExtension = function addExtension(filename, ext = '.js') {
    let result = `${filename}`;
    if (!path.extname(filename)) result += ext;
    return result;
};

// Base class for tree walking, providing methods to manipulate AST nodes
class WalkerBase {
    constructor() {
        this.should_skip = false;
        this.should_remove = false;
        this.replacement = null;

        this.context = {
            skip: () => (this.should_skip = true),
            remove: () => (this.should_remove = true),
            replace: (node) => (this.replacement = node),
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

// Synchronous tree walker class, leveraging WalkerBase
class SyncWalkerClass extends WalkerBase {

    constructor(walker) {
        super();
        this.enter = walker.enter;
        this.leave = walker.leave;
    }

    visit(node, parent, enter, leave, prop, index) {
        if (node) {
            if (enter) {
                const prevState = [this.should_skip, this.should_remove, this.replacement];
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

                const [skipped, removed] = [this.should_skip, this.should_remove];
                [this.should_skip, this.should_remove, this.replacement] = prevState;

                if (skipped) return node;
                if (removed) return null;
            }

            for (const key in node) {
                const value = node[key];
                if (typeof value === 'object') {
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            if (value[i] !== null && typeof value[i].type === 'string') {
                                if (!this.visit(value[i], node, enter, leave, key, i)) {
                                    i--;
                                }
                            }
                        }
                    } else if (value !== null && typeof value.type === 'string') {
                        this.visit(value, node, enter, leave, key, null);
                    }
                }
            }

            if (leave) {
                const prevState = [this.replacement, this.should_remove];
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

                const removed = this.should_remove;
                [this.replacement, this.should_remove] = prevState;

                if (removed) return null;
            }
        }

        return node;
    }
}

// Function to walk an AST and manipulate its nodes
function walk(ast, walker) {
    const instance = new SyncWalkerClass(walker);
    return instance.visit(ast, null, walker.enter, walker.leave);
}

// Extractors for variable names from different AST node types
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
    MemberExpression() { },
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

// Extract assigned names for parameter node
const extractAssignedNames = function extractAssignedNames(param) {
    const names = [];
    extractors[param.type](names, param);
    return names;
};

// Map of block declarations for variable declarations
const blockDeclarations = {
    const: true,
    let: true,
};

// Class representing a scope, holding variable declarations
class Scope {
    constructor(options = {}) {
        this.parent = options.parent;
        this.isBlockScope = !!options.block;
        this.declarations = Object.create(null);

        if (options.params) {
            options.params.forEach((param) => {
                extractAssignedNames(param).forEach((name) => {
                    this.declarations[name] = true;
                });
            });
        }
    }

    addDeclaration(node, isBlockDeclaration, isVar) {
        if (!isBlockDeclaration && this.isBlockScope) {
            this.parent.addDeclaration(node, isBlockDeclaration, isVar);
        } else if (node.id) {
            extractAssignedNames(node.id).forEach((name) => {
                this.declarations[name] = true;
            });
        }
    }

    contains(name) {
        return this.declarations[name] || (this.parent ? this.parent.contains(name) : false);
    }
}

// Attach scopes to an AST
const attachScopes = function attachScopes(ast, propertyName = 'scope') {
    let scope = new Scope();
    walk(ast, {
        enter(node, parent) {
            if (/(Function|Class)Declaration/.test(node.type)) {
                scope.addDeclaration(node, false, false);
            }

            if (node.type === 'VariableDeclaration') {
                const { kind } = node;
                const isBlockDeclaration = blockDeclarations[kind];
                node.declarations.forEach((declaration) => {
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
            if (node[propertyName]) scope = scope.parent;
        },
    });
    return scope;
}

// Check if an argument is an array
function isArray(arg) {
    return Array.isArray(arg);
}

// Ensure that an argument is an array
function ensureArray(thing) {
    if (isArray(thing)) return thing;
    if (thing == null) return [];
    return [thing];
}

// Normalize file paths
const normalizePath = function (filename) {
    return filename.split(path.win32.sep).join(path.posix.sep);
};

// Convert a file path or glob pattern to a matcher string for picomatch
function getMatcherString(id, resolutionBase) {
    if (resolutionBase === false || path.isAbsolute(id) || id.startsWith('*')) {
        return id;
    }

    const basePath = normalizePath(path.resolve(resolutionBase || ''))
        .replace(/[-^$*+?.()|[\]{}]/g, '\\$&');
    
    return path.posix.join(basePath, id);
}

// Create a filter function for including and excluding files based on patterns
const createFilter = function createFilter(include, exclude, options) {
    const resolutionBase = options && options.resolve;
    const getMatcher = (id) => id instanceof RegExp
        ? id
        : {
            test: (what) => {
                const pattern = getMatcherString(id, resolutionBase);
                const fn = pm__default['default'](pattern, { dot: true });
                return fn(what);
            }
        };
    
    const includeMatchers = ensureArray(include).map(getMatcher);
    const excludeMatchers = ensureArray(exclude).map(getMatcher);
    
    return function result(id) {
        if (typeof id !== 'string') return false;
        if (/\0/.test(id)) return false;
        
        const pathId = normalizePath(id);
        
        for (let i = 0; i < excludeMatchers.length; ++i) {
            if (excludeMatchers[i].test(pathId)) return false;
        }
        
        for (let i = 0; i < includeMatchers.length; ++i) {
            if (includeMatchers[i].test(pathId)) return true;
        }
        
        return !includeMatchers.length;
    };
};

// Ensure that a string is a valid JavaScript identifier
const reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public';
const builtins = 'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl';
const forbiddenIdentifiers = new Set(`${reservedWords} ${builtins}`.split(' '));
forbiddenIdentifiers.add('');

const makeLegalIdentifier = function makeLegalIdentifier(str) {
    let identifier = str
        .replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
        .replace(/[^$_a-zA-Z0-9]/g, '_');
    
    if (/\d/.test(identifier[0]) || forbiddenIdentifiers.has(identifier)) {
        identifier = `_${identifier}`;
    }
    
    return identifier || '_';
};

// Convert data to a JSON string representation
function stringify(obj) {
    return (JSON.stringify(obj) || 'undefined').replace(/[\u2028\u2029]/g, (char) => `\\u${`000${char.charCodeAt(0).toString(16)}`.slice(-4)}`);
}

// Serialize an array to a string
function serializeArray(arr, indent, baseIndent) {
    let output = '[';
    const separator = indent ? `\n${baseIndent}${indent}` : '';
    
    for (let i = 0; i < arr.length; i++) {
        const key = arr[i];
        output += `${i > 0 ? ',' : ''}${separator}${serialize(key, indent, baseIndent + indent)}`;
    }
    
    return `${output}${indent ? `\n${baseIndent}` : ''}]`;
}

// Serialize an object to a string
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

// Serialize data to a string representation with an optional indent
function serialize(obj, indent, baseIndent) {
    if (obj === Infinity) return 'Infinity';
    if (obj === -Infinity) return '-Infinity';
    if (obj === 0 && 1 / obj === -Infinity) return '-0';
    if (obj instanceof Date) return `new Date(${obj.getTime()})`;
    if (obj instanceof RegExp) return obj.toString();
    if (obj !== obj) return 'NaN';
    if (Array.isArray(obj)) return serializeArray(obj, indent, baseIndent);
    if (obj === null) return 'null';
    if (typeof obj === 'object') return serializeObject(obj, indent, baseIndent);
    return stringify(obj);
}

// Convert data to an ES module export string
const dataToEsm = function dataToEsm(data, options = {}) {
    const t = options.compact ? '' : 'indent' in options ? options.indent : '\t';
    const _ = options.compact ? '' : ' ';
    const n = options.compact ? '' : '\n';
    const declarationType = options.preferConst ? 'const' : 'var';
    
    if (options.namedExports === false ||
        typeof data !== 'object' ||
        Array.isArray(data) ||
        data instanceof Date ||
        data instanceof RegExp ||
        data === null) {
        
        const code = serialize(data, options.compact ? null : t, '');
        const magic = _ || (/^[{[\-\/]/.test(code) ? '' : ' ');
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
};

// Exports
var index = {
    addExtension,
    attachScopes,
    createFilter,
    dataToEsm,
    extractAssignedNames,
    makeLegalIdentifier,
    normalizePath,
};

exports.addExtension = addExtension;
exports.attachScopes = attachScopes;
exports.createFilter = createFilter;
exports.dataToEsm = dataToEsm;
exports.default = index;
exports.extractAssignedNames = extractAssignedNames;
exports.makeLegalIdentifier = makeLegalIdentifier;
exports.normalizePath = normalizePath;
