const path = require('path');
const expand = require('brace-expansion');

module.exports = minimatch;
minimatch.Minimatch = Minimatch;

// Constants for pattern matching
const GLOBSTAR = {};
const replTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
};

const qmark = '[^/]';
const star = qmark + '*?';
const twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';
const twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';
const reSpecials = charSet('().*{}+?[]^$\\!');

function charSet(s) {
  return s.split('').reduce((set, c) => (set[c] = true, set), {});
}

// Match a pattern to a path
function minimatch(p, pattern, options = {}) {
  if (typeof pattern !== 'string') throw new TypeError('glob pattern string required');
  if (!options.nocomment && pattern.startsWith('#')) return false;
  if (pattern.trim() === '') return p === '';
  return new Minimatch(pattern, options).match(p);
}

minimatch.filter = function (pattern, options) {
  return (p) => minimatch(p, pattern, options);
};

minimatch.defaults = function (def = {}) {
  return createDefaults(def, minimatch, Minimatch);
};

Minimatch.defaults = function (def = {}) {
  return minimatch.defaults(def).Minimatch;
};

function createDefaults(def, origFunction, OrigClass) {
  if (!Object.keys(def).length) return origFunction;

  const newFunction = function (p, pattern, options) {
    return origFunction(p, pattern, Object.assign({}, def, options));
  };

  newFunction.Minimatch = function (pattern, options) {
    return new OrigClass(pattern, Object.assign({}, def, options));
  };

  return newFunction;
}

function Minimatch(pattern, options = {}) {
  if (!(this instanceof Minimatch)) return new Minimatch(pattern, options);
  if (typeof pattern !== 'string') throw new TypeError('glob pattern string required');

  this.options = options;
  this.pattern = pattern.split(path.sep).join('/').trim();
  this.negate = false;
  this.set = [];
  this.make();
}

Minimatch.prototype.debug = function () {};

Minimatch.prototype.make = function () {
  if (this._made) return;

  const options = this.options;
  let pattern = this.pattern;

  if (!options.nocomment && pattern.startsWith('#')) {
    this.comment = true;
    return;
  }
  
  if (!pattern) {
    this.empty = true;
    return;
  }

  this.parseNegate();
  const set = this.globSet = this.braceExpand().map(s => s.split(/\/+/));
  this.globParts = set.map(s => s.map(this.parse, this));
  this.set = this.globParts.filter(s => s.indexOf(false) === -1);
};

Minimatch.prototype.parseNegate = function () {
  const pattern = this.pattern;
  const options = this.options;
  let negate = false;
  let negateOffset = 0;

  if (options.nonegate) return;

  while (pattern.charAt(negateOffset) === '!') {
    negate = !negate;
    negateOffset++;
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset);
  this.negate = negate;
};

minimatch.braceExpand = function (pattern, options) {
  return braceExpand.call(this, pattern, options);
};

Minimatch.prototype.braceExpand = function () {
  return braceExpand.call(this, this.pattern, this.options);
};

function braceExpand(pattern, options = {}) {
  if (this instanceof Minimatch) options = this.options;
  if (!pattern.match(/\{.*\}/)) return [pattern];
  return expand(pattern);
};

Minimatch.prototype.parse = function (pattern, isSub) {
  if (pattern.length > 65536) {
    throw new TypeError('pattern is too long');
  }

  const options = this.options;

  if (!options.noglobstar && pattern === '**') return GLOBSTAR;
  if (pattern === '') return '';

  let re = '';
  let hasMagic = !!options.nocase;
  let escaping = false;
  let inClass = false;
  let reClassStart = -1;
  let classStart = -1;
  let stateChar;
  const patternStart = pattern.startsWith('.') ? '' : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))' : '(?!\\.)';

  for (let i = 0, len = pattern.length; i < len; i++) {
    let c = pattern.charAt(i);

    if (escaping && reSpecials[c]) {
      re += '\\' + c;
      escaping = false;
      continue;
    }

    switch (c) {
      case '/':
        return false;
      case '\\':
        escaping = true;
        continue;
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        if (inClass) {
          if (c === '!' && i === classStart + 1) c = '^';
          re += c;
          continue;
        }
        if (stateChar) re += replTypes[stateChar].close;
        stateChar = c;
        if (options.noext) re += '\\' + stateChar;
        continue;
      case '(':
        if (inClass) {
          re += '(';
          continue;
        }
        if (stateChar) {
          re += replTypes[stateChar].open;
          stateChar = false;
          continue;
        }
        re += '\\(';
        continue;
      case ')':
        if (inClass || !this.patternListStack?.length) {
          re += '\\)';
          continue;
        }
        re += replTypes[stateChar].close;
        continue;
      case '|':
        if (inClass) {
          re += '\\|';
          continue;
        }
        re += '|';
        continue;
      case '[':
        if (inClass) {
          re += '\\' + c;
          continue;
        }
        inClass = true;
        classStart = i;
        reClassStart = re.length;
        re += c;
        continue;
      case ']':
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c;
          continue;
        }
        hasMagic = true;
        inClass = false;
        re += c;
        continue;
      default:
        if (escaping) {
          escaping = false;
        } else if (reSpecials[c]) {
          re += '\\' + c;
        } else {
          re += c;
        }
    }
  }

  if (inClass) {
    const cs = pattern.substring(classStart + 1);
    const sp = this.parse(cs, { sub: true });
    re = re.substring(0, reClassStart) + '\\[' + sp[0];
    hasMagic = hasMagic || sp[1];
  }

  if (!hasMagic) return globUnescape(pattern);
  const flags = options.nocase ? 'i' : '';
  return new RegExp('^' + re + '$', flags);
};

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options).makeRe();
};

Minimatch.prototype.makeRe = function () {
  if (this.regexp || this.regexp === false) return this.regexp;
  const set = this.set;
  if (!set.length) {
    this.regexp = false;
    return this.regexp;
  }
  const options = this.options;
  const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
  const flags = options.nocase ? 'i' : '';

  const re = set.map(pattern => pattern.map(p => p === GLOBSTAR ? twoStar : typeof p === 'string' ? regExpEscape(p) : p._src).join('\\\/')).join('|');
  const finalRe = '^(?:' + re + ')$';

  try {
    this.regexp = new RegExp(finalRe, flags);
  } catch {
    this.regexp = false;
  }

  return this.regexp;
};

minimatch.match = function (list, pattern, options) {
  options = options || {};
  const mm = new Minimatch(pattern, options);
  const matches = list.filter(f => mm.match(f));
  return mm.options.nonull && !matches.length ? [pattern] : matches;
};

Minimatch.prototype.match = function (f, partial) {
  if (this.comment || this.empty) return false;
  if (f === '/' && partial) return true;

  const file = f.split(slashSplit);
  for (const subPattern of this.set) {
    if (this.matchOne(file, subPattern, partial)) return !this.negate;
  }

  return this.negate;
};

Minimatch.prototype.matchOne = function (file, pattern, partial) {
  const options = this.options;
  let fi = 0;
  let pi = 0;
  let fl = file.length;
  let pl = pattern.length;

  for (; (fi < fl) && (pi < pl); fi++, pi++) {
    const p = pattern[pi];
    const f = file[fi];

    if (p === GLOBSTAR) {
      const fr = fi;
      const pr = pi + 1;
      if (pr === pl) {
        for (; fi < fl; fi++) {
          if (
            file[fi] === '.' || file[fi] === '..' || 
            (!options.dot && file[fi].startsWith('.'))
          ) {
            return false;
          }
        }
        return true;
      }

      while (fr < fl) {
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) return true;
        if (file[fr] === '.' || file[fr] === '..' || (!options.dot && file[fr].startsWith('.'))) break;
        fr++;
      }

      if (partial && fr === fl) return true;
      return false;
    }

    if (typeof p === 'string') {
      if ((options.nocase ? f.toLowerCase() === p.toLowerCase() : f === p)) continue;
    } else {
      if(f.match(p)) continue;
    }
    return false;
  }

  return (fi === fl && pi === pl) || (fi === fl && partial) || ((pi === pl) && (fi === fl - 1) && (file[fi] === ''));
};

function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1');
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
