"use strict";

const braceExpansion = require("brace-expansion");
const { assertValidPattern } = require("./assert-valid-pattern.js");
const { AST } = require("./ast.js");
const { escape } = require("./escape.js");
const { unescape } = require("./unescape.js");

const defaultPlatform = typeof process === 'object' && process
    ? process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform
    : 'posix';

const path = {
    win32: { sep: '\\' },
    posix: { sep: '/' }
};

const sep = defaultPlatform === 'win32' ? path.win32.sep : path.posix.sep;

const minimatch = (p, pattern, options = {}) => {
    assertValidPattern(pattern);
    if (!options.nocomment && pattern.charAt(0) === '#') return false;
    return new Minimatch(pattern, options).match(p);
};

// Utility functions for matching common patterns
const starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
const starDotExtTest = (ext) => (f) => !f.startsWith('.') && f.endsWith(ext);
const starDotExtTestDot = (ext) => (f) => f.endsWith(ext);
const starDotExtTestNocase = (ext) => {
    ext = ext.toLowerCase();
    return (f) => !f.startsWith('.') && f.toLowerCase().endsWith(ext);
};
const starDotExtTestNocaseDot = (ext) => {
    ext = ext.toLowerCase();
    return (f) => f.toLowerCase().endsWith(ext);
};

const starDotStarRE = /^\*+\.\*+$/;
const starDotStarTest = (f) => !f.startsWith('.') && f.includes('.');
const starDotStarTestDot = (f) => f !== '.' && f !== '..' && f.includes('.');
const dotStarRE = /^\.\*+$/;
const dotStarTest = (f) => f !== '.' && f !== '..' && f.startsWith('.');

const starRE = /^\*+$/;
const starTest = (f) => f.length !== 0 && !f.startsWith('.');
const starTestDot = (f) => f.length !== 0 && f !== '.' && f !== '..';

const qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
const qmarksTest = ([$0, ext = '']) => {
    const noext = qmarksTestNoExt([$0]);
    return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
const qmarksTestDot = ([$0, ext = '']) => {
    const noext = qmarksTestNoExtDot([$0]);
    return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
const qmarksTestNocase = ([$0, ext = '']) => {
    const noext = qmarksTestNoExt([$0]);
    if (!ext) return noext;
    ext = ext.toLowerCase();
    return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
const qmarksTestNocaseDot = ([$0, ext = '']) => {
    const noext = qmarksTestNoExtDot([$0]);
    if (!ext) return noext;
    ext = ext.toLowerCase();
    return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
const qmarksTestNoExt = ([$0]) => {
    const len = $0.length;
    return (f) => f.length === len && !f.startsWith('.');
};
const qmarksTestNoExtDot = ([$0]) => {
    const len = $0.length;
    return (f) => f.length === len && f !== '.' && f !== '..';
};

class Minimatch {
    constructor(pattern, options = {}) {
        assertValidPattern(pattern);
        this.options = options;
        this.pattern = pattern;
        this.platform = options.platform || defaultPlatform;
        this.isWindows = this.platform === 'win32';
        this.windowsPathsNoEscape =
            !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
        if (this.windowsPathsNoEscape) {
            this.pattern = this.pattern.replace(/\\/g, '/');
        }
        this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
        this.regexp = null;
        this.negate = false;
        this.nonegate = !!options.nonegate;
        this.comment = false;
        this.empty = false;
        this.partial = !!options.partial;
        this.nocase = !!this.options.nocase;
        this.windowsNoMagicRoot =
            options.windowsNoMagicRoot !== undefined
                ? options.windowsNoMagicRoot
                : !!(this.isWindows && this.nocase);
        this.globSet = [];
        this.globParts = [];
        this.set = [];
        this.make();
    }

    make() {
        const pattern = this.pattern;
        const options = this.options;
        if (!options.nocomment && pattern.charAt(0) === '#') {
            this.comment = true;
            return;
        }
        if (!pattern) {
            this.empty = true;
            return;
        }
        this.parseNegate();
        this.globSet = [...new Set(this.braceExpand())];
        const rawGlobParts = this.globSet.map(s => this.slashSplit(s));
        this.globParts = this.preprocess(rawGlobParts);
        this.set = this.globParts.map((s, _, __) => {
            if (this.isWindows && this.windowsNoMagicRoot) {
                const isUNC = s[0] === '' &&
                    s[1] === '' &&
                    (s[2] === '?' || !globMagic.test(s[2])) &&
                    !globMagic.test(s[3]);
                const isDrive = /^[a-z]:/i.test(s[0]);
                if (isUNC) {
                    return [...s.slice(0, 4), ...s.slice(4).map(ss => this.parse(ss))];
                } else if (isDrive) {
                    return [s[0], ...s.slice(1).map(ss => this.parse(ss))];
                }
            }
            return s.map(ss => this.parse(ss));
        });
        this.set = this.set.filter(s => s.indexOf(false) === -1);
        if (this.isWindows) {
            for (let i = 0; i < this.set.length; i++) {
                const p = this.set[i];
                if (p[0] === '' &&
                    p[1] === '' &&
                    this.globParts[i][2] === '?' &&
                    typeof p[3] === 'string' &&
                    /^[a-z]:$/i.test(p[3])) {
                    p[2] = '?';
                }
            }
        }
    }

    parseNegate() {
        if (this.nonegate) return;
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

    matchOne(file, pattern, partial = false) {
        const options = this.options;
        if (this.isWindows) {
            const fileDrive = typeof file[0] === 'string' && /^[a-z]:$/i.test(file[0]);
            const fileUNC = !fileDrive &&
                file[0] === '' &&
                file[1] === '' &&
                file[2] === '?' &&
                /^[a-z]:$/i.test(file[3]);
            const patternDrive = typeof pattern[0] === 'string' && /^[a-z]:$/i.test(pattern[0]);
            const patternUNC = !patternDrive &&
                pattern[0] === '' &&
                pattern[1] === '' &&
                pattern[2] === '?' &&
                typeof pattern[3] === 'string' &&
                /^[a-z]:$/i.test(pattern[3]);
            const fdi = fileUNC ? 3 : fileDrive ? 0 : undefined;
            const pdi = patternUNC ? 3 : patternDrive ? 0 : undefined;
            if (typeof fdi === 'number' && typeof pdi === 'number') {
                const [fd, pd] = [file[fdi], pattern[pdi]];
                if (fd.toLowerCase() === pd.toLowerCase()) {
                    pattern[pdi] = fd;
                    if (pdi > fdi) {
                        pattern = pattern.slice(pdi);
                    } else if (fdi > pdi) {
                        file = file.slice(fdi);
                    }
                }
            }
        }
        const { optimizationLevel = 1 } = this.options;
        if (optimizationLevel >= 2) {
            file = this.levelTwoFileOptimize(file);
        }
        for (let fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
            const p = pattern[pi];
            const f = file[fi];
            if (p === false) {
                return false;
            }
            if (p === GLOBSTAR) {
                let fr = fi;
                let pr = pi + 1;
                if (pr === pl) {
                    for (; fi < fl; fi++) {
                        if (file[fi] === '.' || file[fi] === '..' || (!options.dot && file[fi].charAt(0) === '.')) return false;
                    }
                    return true;
                }
                while (fr < fl) {
                    const swallowee = file[fr];
                    if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
                        return true;
                    } else {
                        if (swallowee === '.' || swallowee === '..' || (!options.dot && swallowee.charAt(0) === '.')) break;
                        fr++;
                    }
                }
                return false;
            }
            let hit;
            if (typeof p === 'string') {
                hit = f === p;
            } else {
                hit = p.test(f);
            }
            if (!hit) return false;
        }
        if (fi === fl && pi === pl) {
            return true;
        } else if (fi === fl) {
            return partial;
        } else if (pi === pl) {
            return fi === fl - 1 && file[fi] === '';
        } else {
            throw new Error('wtf?');
        }
    }

    braceExpand() {
        assertValidPattern(this.pattern);
        return (braceExpansion(this.pattern));
    }

    parse(pattern) {
        assertValidPattern(pattern);
        if (pattern === '**') return GLOBSTAR;
        if (pattern === '') return '';
        let m;
        let fastTest = null;
        if ((m = pattern.match(starRE))) {
            fastTest = this.options.dot ? starTestDot : starTest;
        } else if ((m = pattern.match(starDotExtRE))) {
            fastTest = (this.options.nocase
                ? this.options.dot
                    ? starDotExtTestNocaseDot
                    : starDotExtTestNocase
                : this.options.dot
                    ? starDotExtTestDot
                    : starDotExtTest)(m[1]);
        } else if ((m = pattern.match(qmarksRE))) {
            fastTest = (this.options.nocase
                ? this.options.dot
                    ? qmarksTestNocaseDot
                    : qmarksTestNocase
                : this.options.dot
                    ? qmarksTestDot
                    : qmarksTest)(m);
        } else if ((m = pattern.match(starDotStarRE))) {
            fastTest = this.options.dot ? starDotStarTestDot : starDotStarTest;
        } else if ((m = pattern.match(dotStarRE))) {
            fastTest = dotStarTest;
        }
        const re = AST.fromGlob(pattern, this.options).toMMPattern();
        if (fastTest && typeof re === 'object') {
            Reflect.defineProperty(re, 'test', { value: fastTest });
        }
        return re;
    }

    match(f, partial = this.partial) {
        if (this.comment) return false;
        if (this.empty) return f === '';
        if (f === '/' && partial) return true;
        const options = this.options;
        if (this.isWindows) {
            f = f.split('\\').join('/');
        }
        const ff = this.slashSplit(f);
        let filename = ff[ff.length - 1];
        if (!filename) {
            for (let i = ff.length - 2; !filename && i >= 0; i--) {
                filename = ff[i];
            }
        }
        for (let i = 0; i < this.set.length; i++) {
            const pattern = this.set[i];
            let file = ff;
            if (options.matchBase && pattern.length === 1) {
                file = [filename];
            }
            const hit = this.matchOne(file, pattern, partial);
            if (hit) {
                if (options.flipNegate) {
                    return true;
                }
                return !this.negate;
            }
        }
        if (options.flipNegate) {
            return false;
        }
        return this.negate;
    }

    static defaults(def) {
        return minimatch.defaults(def).Minimatch;
    }
}

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
        GLOBSTAR: GLOBSTAR,
    });
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

const GLOBSTAR = Symbol('globstar **');
const globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
const regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

minimatch.sep = sep;
minimatch.GLOBSTAR = GLOBSTAR;
minimatch.filter = filter;
minimatch.defaults = defaults;
minimatch.makeRe = makeRe;
minimatch.match = match;
minimatch.braceExpand = braceExpand;
minimatch.AST = AST;
minimatch.Minimatch = Minimatch;
minimatch.escape = escape;
minimatch.unescape = unescape;

exports.minimatch = minimatch;
exports.sep = sep;
exports.GLOBSTAR = GLOBSTAR;
exports.filter = filter;
exports.defaults = defaults;
exports.braceExpand = braceExpand;
exports.makeRe = makeRe;
exports.match = match;
exports.Minimatch = Minimatch;
exports.AST = AST;
exports.escape = escape;
exports.unescape = unescape;
