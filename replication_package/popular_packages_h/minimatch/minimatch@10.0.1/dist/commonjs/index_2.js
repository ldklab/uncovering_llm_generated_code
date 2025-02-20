"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const braceExpansion = require("brace-expansion");
const { assertValidPattern } = require("./assert-valid-pattern.js");
const { AST } = require("./ast.js");
const { escape } = require("./escape.js");
const { unescape } = require("./unescape.js");

exports.sep = process.platform === 'win32' ? '\\' : '/';
const GLOBSTAR = Symbol('globstar **');
const qmark = '[^/]';
const star = qmark + '*?';
const twoStarDot = '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';
const twoStarNoDot = '(?:(?!(?:\\/|^)\\.).)*?';

const defaults = (def) => {
    return (p, pattern, options = {}) => {
        options = {...def, ...options};
        return minimatch(p, pattern, options);
    }
}

const minimatch = (p, pattern, options = {}) => {
    assertValidPattern(pattern);
    if (!options.nocomment && pattern.charAt(0) === '#') return false;
    return new Minimatch(pattern, options).match(p);
};

class Minimatch {
    constructor(pattern, options = {}) {
        assertValidPattern(pattern);
        this.options = options;
        this.pattern = pattern;
        this.isWindows = options.platform === 'win32';
        this.set = [];
        this.globSet = [];
        this.globParts = [];
        this.make();
    }

    make() {
        this.parseNegate();
        this.globSet = [...new Set(this.braceExpand())];
        this.globParts = this.globSet.map(s => this.slashSplit(s));
        this.set = this.globParts.map(parts => this.partsToRegExp(parts));
    }

    parseNegate() {
        const pattern = this.pattern;
        let negate = false;
        let negateOffset = 0;
        for (let i = 0; i < pattern.length && pattern.charAt(i) === '!'; i++) {
            negate = !negate;
            negateOffset++;
        }
        if (negateOffset) this.pattern = pattern.slice(negateOffset);
        this.negate = negate;
    }

    braceExpand() {
        return braceExpansion(this.pattern);
    }

    slashSplit(p) {
        return this.options.preserveMultipleSlashes ? p.split('/') : p.split(/\/+/);
    }

    partsToRegExp(parts) {
        return parts.map(part => {
            if (part === '**') return GLOBSTAR;
            if (part === '') return '';
            return new RegExp(AST.fromGlob(part, this.options).toMMPattern());
        });
    }

    match(f) {
        let filename = f.split(exports.sep).pop();
        for (let i = 0; i < this.set.length; i++) {
            let pattern = this.set[i];
            let file = this.options.matchBase && pattern.length === 1 ? [filename] : f.split(exports.sep);
            if (this.matchOne(file, pattern)) {
                return !this.negate;
            }
        }
        return this.negate;
    }

    matchOne(file, pattern) {
        for (let fi = 0, pi = 0; fi < file.length && pi < pattern.length; fi++, pi++) {
            let p = pattern[pi];
            let f = file[fi];
            if (p === GLOBSTAR) return this.handleGlobstar(file, f, fi, pattern, pi);
            if (typeof p === 'string' ? p !== f : !p.test(f)) return false;
        }
        return true;
    }

    handleGlobstar(file, f, fi, pattern, pi) {
       while (fi < file.length) {
            if (this.matchOne(file.slice(fi), pattern.slice(pi + 1))) return true;
            const swallowee = file[fi];
            if (swallowee === '.' || swallowee === '..' || !this.options.dot && swallowee.charAt(0) === '.') break;
            fi++;
        }
        return false;
    }
}

exports.minimatch = minimatch;
exports.Minimatch = Minimatch;
exports.defaults = defaults;
exports.GLOBSTAR = GLOBSTAR;
exports.escape = escape;
exports.unescape = unescape;
