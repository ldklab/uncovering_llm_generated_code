"use strict";

const braceExpansion = require("brace-expansion");
const assertValidPattern = require("./assert-valid-pattern.js");
const { AST } = require("./ast.js");
const { escape } = require("./escape.js");
const { unescape } = require("./unescape.js");

const minimatch = (p, pattern, options = {}) => {
    assertValidPattern(pattern);
    return !(!options.nocomment && pattern.charAt(0) === '#') && new Minimatch(pattern, options).match(p);
};

const patternTests = {
    starDotExtRE: /^\*+([^+@!?\*\[\(]*)$/,
    starDotStarRE: /^\*+\.\*+$/,
    dotStarRE: /^\.\*+$/,
    starRE: /^\*+$/,
    qmarksRE: /^\?+([^+@!?\*\[\(]*)?$/
};

const platformSettings = (() => {
    const defaultPlatform = typeof process === 'object' && process ? process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : 'posix';
    const path = { win32: { sep: '\\' }, posix: { sep: '/' } };
    return {
        sep: defaultPlatform === 'win32' ? path.win32.sep : path.posix.sep,
        isWindows: defaultPlatform === 'win32'
    };
})();

const { sep, isWindows } = platformSettings;
const GLOBSTAR = Symbol('globstar **');

const filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);

const ext = (a, b = {}) => Object.assign({}, a, b);

const defaults = (def) => {
    if (!def || typeof def !== 'object' || !Object.keys(def).length) {
        return minimatch;
    }
    const orig = minimatch;
    const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
    return Object.assign(m, {
        Minimatch: class Minimatch extends orig.Minimatch {
            constructor(pattern, options = {}) {
                super(pattern, ext(def, options));
            }
            static defaults(options) {
                return orig.defaults(ext(def, options)).Minimatch;
            }
        },
        AST: class AST extends orig.AST {
            constructor(type, parent, options = {}) {
                super(type, parent, ext(def, options));
            }
            static fromGlob(pattern, options = {}) {
                return orig.AST.fromGlob(pattern, ext(def, options));
            }
        },
        unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
        escape: (s, options = {}) => orig.escape(s, ext(def, options)),
        filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
        defaults: (options) => orig.defaults(ext(def, options)),
        makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
        braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
        match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
        sep: orig.sep,
        GLOBSTAR: GLOBSTAR
    });
};

const braceExpand = (pattern, options = {}) => {
    assertValidPattern(pattern);
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
        return [pattern];
    }
    return braceExpansion(pattern);
};

const makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();

const match = (list, pattern, options = {}) => {
    const mm = new Minimatch(pattern, options);
    list = list.filter(f => mm.match(f));
    if (mm.options.nonull && !list.length) {
        list.push(pattern);
    }
    return list;
};

class Minimatch {
    constructor(pattern, options = {}) {
        assertValidPattern(pattern);
        options = options || {};
        this.options = options;
        this.pattern = pattern;
        this.isWindows = this.options.platform === 'win32';
        this.regexp = null;
        this.negate = false;
        this.nonegate = !!options.nonegate;
        this.comment = false;
        this.empty = false;
        this.partial = !!options.partial;
        this.nocase = !!options.nocase;
        this.set = [];
        this.globSet = [];
        this.globParts = [];
        this.make();
    }

    make() {
        this.makeRegExp();
    }

    makeRegExp() {
        // Implementation logic
    }

    match(f, partial = this.partial) {
        // Matching logic
        return false;
    }

    static defaults(def) {
        return minimatch.defaults(def).Minimatch;
    }
}

minimatch.AST = AST;
minimatch.escape = escape;
minimatch.unescape = unescape;
minimatch.braceExpand = braceExpand;
minimatch.makeRe = makeRe;
minimatch.match = match;
minimatch.Minimatch = Minimatch;
minimatch.sep = sep;
minimatch.GLOBSTAR = GLOBSTAR;
minimatch.defaults = defaults;
minimatch.filter = filter;

exports.minimatch = minimatch;
exports.braceExpand = braceExpand;
exports.makeRe = makeRe;
exports.match = match;
exports.defaults = defaults;
exports.filter = filter;
exports.Minimatch = Minimatch;
exports.sep = sep;
exports.GLOBSTAR = GLOBSTAR;
exports.AST = AST;
exports.escape = escape;
exports.unescape = unescape;
