"use strict";
const { default: braceExpansion } = require("brace-expansion");
const { assertValidPattern } = require("./assert-valid-pattern.js");
const { AST } = require("./ast.js");
const { escape } = require("./escape.js");
const { unescape } = require("./unescape.js");

const defaultPlatform = (
    typeof process === 'object' && process
        ? process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform
        : 'posix'
);

const path = {
    win32: { sep: '\\' },
    posix: { sep: '/' },
};

const sep = defaultPlatform === 'win32' ? path.win32.sep : path.posix.sep;

const GLOBSTAR = Symbol('globstar **');

const starRE = /^\*+$/;
const starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
const qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
const starDotStarRE = /^\*+\.\*+$/;
const dotStarRE = /^\.\*+$/;

const assertExt = (a, b = {}) => Object.assign({}, a, b);

class Minimatch {
    constructor(pattern, options = {}) {
        assertValidPattern(pattern);
        this.pattern = pattern;
        this.options = options;
        this.regexp = null;
        this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
        this.platform = options.platform || defaultPlatform;
        this.isWindows = this.platform === 'win32';

        if (this.windowsPathsNoEscape) {
            this.pattern = this.pattern.replace(/\\/g, '/');
        }

        this.set = [];
        this.make();
    }

    make() {
        const pattern = this.pattern;
        const options = this.options;

        this.parseNegate();
        this.globSet = [...new Set(this.braceExpand())];

        const rawGlobParts = this.globSet.map(s => s.split('/'));
        this.globParts = this.preprocess(rawGlobParts);

        const set = this.globParts.map((parts) =>
            this.isWindows && this.isDrive(parts) ? this.parseDrive(parts) : parts.map(ss => this.parse(ss))
        );

        this.set = set.filter(s => s.indexOf(false) === -1);
    }

    isDrive(parts) {
        return /^[a-z]:$/i.test(parts[0]) || (parts[0] === '' && parts[1] === '' && /^[a-z]:$/i.test(parts[3]));
    }

    parseDrive(parts) {
        return parts.slice(0, 4).concat(parts.slice(4).map(ss => this.parse(ss)));
    }

    preprocess(globParts) {
        return globParts.map(parts => parts.reduce((acc, part) => {
            const prev = acc[acc.length - 1];
            if (part === '**' && prev === '**') return acc;
            if (part === '..' && prev && prev !== '..' && prev !== '.' && prev !== '**') {
                acc.pop();
                return acc;
            }
            acc.push(part);
            return acc;
        }, []));
    }

    parseNegate() {
        if (this.options.nonegate) return;
        let negate = false;
        let negateOffset = 0;

        for (let i = 0; i < this.pattern.length && this.pattern.charAt(i) === '!'; i++) {
            negate = !negate;
            negateOffset++;
        }

        if (negateOffset) this.pattern = this.pattern.slice(negateOffset);
        this.negate = negate;
    }

    braceExpand() {
        if (this.options.nobrace || !/\{(?:(?!\{).)*\}/.test(this.pattern)) {
            return [this.pattern];
        }
        return braceExpansion(this.pattern);
    }

    parse(ss) {
        assertValidPattern(ss);
        const options = this.options;

        if (ss === '**') return GLOBSTAR;

        const fastTest = this.getFastTest(ss);
        const re = AST.fromGlob(ss, options).toMMPattern();

        if (fastTest && typeof re === 'object') {
            Reflect.defineProperty(re, 'test', { value: fastTest });
        }

        return re;
    }

    getFastTest(ss) {
        const options = this.options;

        if (ss.match(starRE)) {
            return options.dot ? f => f.length !== 0 : f => f.length !== 0 && !f.startsWith('.');
        }

        if (ss.match(starDotExtRE)) {
            const ext = RegExp.$1.toLowerCase();
            return options.nocase
                ? (options.dot ? f => f.toLowerCase().endsWith(ext) : f => !f.startsWith('.') && f.toLowerCase().endsWith(ext))
                : (options.dot ? f => f.endsWith(ext) : f => !f.startsWith('.') && f.endsWith(ext));
        }

        if (ss.match(qmarksRE)) {
            return this.getQmarksTest(ss);
        }

        if (ss.match(starDotStarRE)) {
            return options.dot ? f => f !== '.' && f !== '..' && f.includes('.') : f => !f.startsWith('.') && f.includes('.');
        }

        if (ss.match(dotStarRE)) {
            return f => f !== '.' && f !== '..' && f.startsWith('.');
        }

        return null;
    }

    getQmarksTest(ss) {
        const options = this.options;
        const len = RegExp.$1.length;
        const ext = (RegExp.$2 || '').toLowerCase();

        return options.nocase
            ? (!ext ? f => f.length === len && !f.startsWith('.') : f => f.length === len && !f.startsWith('.') && f.toLowerCase().endsWith(ext))
            : (!ext ? f => f.length === len : f => f.length === len && f.endsWith(ext));
    }

    match(f, partial = false) {
        if (typeof f === 'string') {
            f = f.split('/').filter(Boolean);
        }

        for (const pattern of this.set) {
            if (this.matchOne(f, pattern, partial)) {
                return !this.negate;
            }
        }

        return this.negate;
    }

    matchOne(file, pattern, partial = false) {
        const options = this.options;

        let fi = 0;
        let pi = 0;
        let fl = file.length;
        let pl = pattern.length;

        while (fi < fl && pi < pl) {
            const p = pattern[pi];
            const f = file[fi];

            if (p === GLOBSTAR) {
                if (pi === pl - 1) return true;

                while (fi < fl) {
                    if (this.matchOne(file.slice(fi), pattern.slice(pi + 1), partial)) return true;

                    if (file[fi] === '.' || file[fi] === '..' || (!options.dot && file[fi].charAt(0) === '.')) break;

                    fi++;
                }
                return partial;
            }

            if (this.isMatch(p, f)) {
                return false;
            }

            fi++;
            pi++;
        }

        return fi === fl && (pi === pl || (partial && (pi + 1 === pl && pattern[pi] === '')));
    }

    isMatch(p, f) {
        return (typeof p === 'string') ? p === f : p.test(f) === false;
    }

    makeRe() {
        if (this.regexp || this.regexp === false) return this.regexp;

        const set = this.set;
        if (!set.length) {
            this.regexp = false;
            return this.regexp;
        }

        const options = this.options;
        const twoStar = options.noglobstar ? '[^/]*?' : options.dot ? '(?:(?!(?:\\/|^)\\.).)*?' : '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';

        const flags = new Set(options.nocase ? ['i'] : []);

        let re = set
            .map(pattern => pattern.map(p => {
                if (typeof p === 'string') {
                    return p.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                } else if (p === GLOBSTAR) {
                    return GLOBSTAR;
                }
                for (const flag of p.flags.split('')) flags.add(flag);
                return p._src;
            }))
            .map(pp => this.processGlobStar(pp, twoStar).filter(p => p !== GLOBSTAR).join('/'))
            .join('|');

        re = '^' + (set.length > 1 ? '(?:' : '') + re + (set.length > 1 ? ')' : '') + '$';

        if (this.negate) re = '^(?!' + re + ').+$';

        try {
            this.regexp = new RegExp(re, [...flags].join(''));
        } catch (ex) {
            this.regexp = false;
        }
        return this.regexp;
    }

    processGlobStar(pp, twoStar) {
        return pp.map((p, i) => {
            const next = pp[i + 1];
            const prev = pp[i - 1];

            if (p !== GLOBSTAR || prev === GLOBSTAR) {
                return p;
            }

            if (!prev) {
                pp[i + 1] = next !== GLOBSTAR ? '(?:\\/|' + twoStar + '\\/)?' + next : twoStar;
            } else if (!next) {
                pp[i - 1] = prev + '(?:\\/|' + twoStar + ')?';
            } else if (next !== GLOBSTAR) {
                pp[i - 1] = prev + '(?:\\/|\\/' + twoStar + '\\/)' + next;
                pp[i + 1] = GLOBSTAR;
            }
        });
    }

    static defaults(def) {
        return extendMinimatch(def).Minimatch;
    }
}

function extendMinimatch(def) {
    const defaultedMinimatch = (p, pattern, options = {}) => {
        return minimatch(p, pattern, assertExt(def, options));
    };

    return Object.assign(defaultedMinimatch, {
        Minimatch: class extends Minimatch {
            constructor(pattern, options = {}) {
                super(pattern, assertExt(def, options));
            }

            static defaults(options) {
                return extendMinimatch(assertExt(def, options)).Minimatch;
            }
        },
        unescape: (s, options = {}) => unescape(s, assertExt(def, options)),
        escape: (s, options = {}) => escape(s, assertExt(def, options)),
    });
}

function minimatch(p, pattern, options = {}) {
    assertValidPattern(pattern);
    return !options.nocomment && pattern.charAt(0) === '#' ? false : new Minimatch(pattern, options).match(p);
}

const braceExpand = (pattern, options = {}) => {
    assertValidPattern(pattern);
    return options.nobrace ? [pattern] : braceExpansion(pattern);
};

const filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);
const makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
const match = (list, pattern, options = {}) => {
    const mm = new Minimatch(pattern, options);
    return list.filter(f => mm.match(f)).length ? list : [pattern];
};

const defaults = (def) => extendMinimatch(def);

module.exports = {
    minimatch,
    Minimatch,
    braceExpand,
    makeRe,
    filter,
    match,
    defaults,
    sep,
    GLOBSTAR,
    escape,
    unescape,
    AST,
};
