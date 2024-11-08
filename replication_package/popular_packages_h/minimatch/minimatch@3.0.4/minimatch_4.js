const path = require('path');
const expand = require('brace-expansion');

const GLOBSTAR = {};
const qmark = '[^/]';
const star = qmark + '*?';
const twoStarDot = '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';
const twoStarNoDot = '(?:(?!(?:\\/|^)\\.).)*?';
const reSpecials = charSet('().*{}+?[]^$\\!');
const slashSplit = /\/+/;

function charSet(s) {
  return s.split('').reduce((set, c) => (set[c] = true, set), {});
}

const plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)' },
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
};

function filter(pattern, options = {}) {
  return (p) => minimatch(p, pattern, options);
}

function ext(a = {}, b = {}) {
  return { ...b, ...a };
}

function minimatch(p, pattern, options = {}) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required');
  }

  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false;
  }

  if (pattern.trim() === '') return p === '';

  return new Minimatch(pattern, options).match(p);
}

minimatch.Minimatch = class Minimatch {
  constructor(pattern, options = {}) {
    if (typeof pattern !== 'string') {
      throw new TypeError('glob pattern string required');
    }

    pattern = pattern.trim();
    if (path.sep !== '/') {
      pattern = pattern.split(path.sep).join('/');
    }

    this.options = options;
    this.pattern = pattern;
    this.negate = false;
    this.comment = false;
    this.empty = false;
    this.set = [];
    this.make();
  }

  make() {
    if (this._made) return;
    const pattern = this.pattern;

    if (!this.options.nocomment && pattern.charAt(0) === '#') {
      this.comment = true;
      return;
    }

    if (!pattern) {
      this.empty = true;
      return;
    }

    this.parseNegate();
    const set = this.globSet = this.braceExpand();
    this.globParts = set.map(s => s.split(slashSplit));
    this.set = this.globParts.map(s => s.map(this.parse, this)).filter(s => s.indexOf(false) === -1);
  }

  parseNegate() {
    const pattern = this.pattern;
    let negate = false;
    const options = this.options;
    let negateOffset = 0;

    if (options.nonegate) return;

    for (let i = 0, l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
      negate = !negate;
      negateOffset++;
    }

    if (negateOffset) this.pattern = pattern.substr(negateOffset);
    this.negate = negate;
  }

  braceExpand() {
    const pattern = this.pattern;
    const options = this.options;
    if (options.nobrace || !pattern.match(/\{.*\}/)) {
      return [pattern];
    }
    return expand(pattern);
  }

  parse(pattern) {
    if (pattern.length > 1024 * 64) {
      throw new TypeError('pattern is too long');
    }

    const options = this.options;
    if (!options.noglobstar && pattern === '**') return GLOBSTAR;
    if (pattern === '') return '';

    let re = '';
    let hasMagic = !!options.nocase;
    let escaping = false;
    let inClass = false;
    let stateChar;
    let classStart = -1;
    const negativeLists = [];
    const patternListStack = [];
    const patternStart = pattern.charAt(0) === '.' ? '' : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))' : '(?!\\.)';

    function clearStateChar() {
      if (stateChar) {
        switch (stateChar) {
          case '*': re += star; hasMagic = true; break;
          case '?': re += qmark; hasMagic = true; break;
          default: re += '\\' + stateChar; break;
        }
        stateChar = false;
      }
    }

    for (let i = 0, len = pattern.length, c; (i < len) && (c = pattern.charAt(i)); i++) {
      if (escaping && reSpecials[c]) {
        re += '\\' + c;
        escaping = false;
        continue;
      }

      switch (c) {
        case '/': return false;
        case '\\': clearStateChar(); escaping = true; continue;
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
          clearStateChar();
          stateChar = c;
          if (options.noext) clearStateChar();
          continue;

        case '(': 
          if (inClass) {
            re += '(';
            continue;
          }
          if (!stateChar) {
            re += '\\(';
            continue;
          }
          patternListStack.push({ type: stateChar, start: i - 1, reStart: re.length, open: plTypes[stateChar].open, close: plTypes[stateChar].close });
          re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
          stateChar = false;
          continue;

        case ')':
          if (inClass || !patternListStack.length) {
            re += '\\)';
            continue;
          }
          clearStateChar();
          hasMagic = true;
          const pl = patternListStack.pop();
          re += pl.close;
          if (pl.type === '!') negativeLists.push(pl);
          continue;

        case '|':
          if (inClass || !patternListStack.length || escaping) {
            re += '\\|';
            escaping = false;
            continue;
          }
          clearStateChar();
          re += '|';
          continue;

        case '[':
          clearStateChar();
          if (inClass) {
            re += '\\' + c;
            continue;
          }
          inClass = true;
          classStart = i;
          re += c;
          continue;

        case ']':
          if (i === classStart + 1 || !inClass) {
            re += '\\' + c;
            escaping = false;
            continue;
          }
          if (inClass) {
            const cs = pattern.substring(classStart + 1, i);
            try {
              RegExp('[' + cs + ']');
            } catch (er) {
              const sp = this.parse(cs);
              re = re.substr(0, re.classStart) + '\\[' + sp[0] + '\\]';
              hasMagic = hasMagic || sp[1];
              inClass = false;
              continue;
            }
          }
          hasMagic = true;
          inClass = false;
          re += c;
          continue;

        default:
          clearStateChar();
          if (escaping) {
            escaping = false;
          } else if (reSpecials[c]) {
            re += '\\';
          }
          re += c;
      }
    }

    clearStateChar();
    if (escaping) {
      re += '\\\\';
    }

    if (re !== '' && hasMagic) {
      re = '(?=.)' + re;
    }

    if (typeof pattern === 'undefined') return [re, hasMagic];
    return globUnescape(pattern);
  }

  match(f, partial) {
    if (this.comment) return false;
    if (this.empty) return f === '';
    if (f === '/' && partial) return true;

    if (path.sep !== '/') {
      f = f.split(path.sep).join('/');
    }

    const parts = f.split(slashSplit);
    const set = this.set;

    const filename = parts.reduce((prev, current) => current || prev, '');

    for (const pattern of set) {
      const file = this.options.matchBase && pattern.length === 1 ? [filename] : parts;
      const hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (this.options.flipNegate) return true;
        return !this.negate;
      }
    }
    if (this.options.flipNegate) return false;
    return this.negate;
  }

  matchOne(file, pattern, partial) {
    const options = this.options;

    for (let fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
      const p = pattern[pi];
      const f = file[fi];

      if (p === false) return false;

      if (p === GLOBSTAR) {
        let fr = fi, pr = pi + 1;
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
          } else if (swallowee === '.' || swallowee === '..' || (!options.dot && swallowee.charAt(0) === '.')) {
            break;
          }

          fr++;
        }

        if (partial) return fr === fl;
        return false;
      }

      const hit = typeof p === 'string' ? options.nocase ? f.toLowerCase() === p.toLowerCase() : f === p : f.match(p);
      if (!hit) return false;
    }

    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      const emptyFileEnd = (fi === fl - 1) && (file[fi] === '');
      return emptyFileEnd;
    }

    throw new Error('wtf?');
  }
};

minimatch.makeRe = function(pattern, options) {
  return new minimatch.Minimatch(pattern, options).makeRe();
};

Minimatch.prototype.makeRe = function() {
  if (this.regexp || this.regexp === false) return this.regexp;
  const set = this.set;
  if (!set.length) {
    this.regexp = false;
    return this.regexp;
  }

  const options = this.options;
  const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
  const flags = options.nocase ? 'i' : '';

  const re = set.map(pattern => pattern.map(p => (p === GLOBSTAR) ? twoStar : (typeof p === 'string') ? regExpEscape(p) : p._src).join('\\\/')).join('|');
  let fullPattern = '^(?:' + re + ')$';
  if (this.negate) fullPattern = '^(?!' + fullPattern + ').*$';

  try {
    this.regexp = new RegExp(fullPattern, flags);
  } catch (ex) {
    this.regexp = false;
  }
  return this.regexp;
};

minimatch.match = function(list, pattern, options = {}) {
  const mm = new minimatch.Minimatch(pattern, options);
  return list.filter(f => mm.match(f)).length ? list : [...list, pattern];
};

function globUnescape(s) {
  return s.replace(/\\(.)/g, '$1');
}

function regExpEscape(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = minimatch;
