const path = require('path');
const expand = require('brace-expansion');

const GLobStar = {};
const qmark = '[^/]';
const star = `${qmark}*?`;
const twoStarDot = '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';
const twoStarNoDot = '(?:(?!(?:\\/|^)\\.).)*?';
const reSpecials = new Set('().*{}+?[]^$\\!');
const slashSplit = /\/+/;

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
  if (typeof pattern !== 'string') throw new TypeError('glob pattern string required');
  if (!options.nocomment && pattern.charAt(0) === '#') return false;
  if (pattern.trim() === '') return p === '';
  return new Minimatch(pattern, options).match(p);
}

minimatch.filter = filter;

function Minimatch(pattern, options = {}) {
  if (!(this instanceof Minimatch)) return new Minimatch(pattern, options);
  this.options = options;
  pattern = pattern.trim();
  if (path.sep !== '/') pattern = pattern.split(path.sep).join('/');
  this.pattern = pattern;
  this.set = [];
  this.make();
}

Minimatch.prototype.make = function() {
  if (this._made) return;
  let pattern = this.pattern;
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
  let set = this.globSet = this.braceExpand();
  set = this.globParts = set.map((s) => s.split(slashSplit));
  set = set.map((p) => p.map(this.parse, this));
  set = set.filter((s) => s.indexOf(false) === -1);
  this.set = set;
};

Minimatch.prototype.parseNegate = function() {
  if (this.options.nonegate) return;
  let negate = false;
  let negateOffset = 0;
  while (this.pattern.charAt(negateOffset) === '!') {
    negate = !negate;
    negateOffset++;
  }
  if (negateOffset) this.pattern = this.pattern.slice(negateOffset);
  this.negate = negate;
};

minimatch.defaults = function(def) {
  if (!def || !Object.keys(def).length) return minimatch;
  const orig = minimatch;
  const m = (p, pattern, options) => orig.minimatch(p, pattern, ext(def, options));
  m.Minimatch = (pattern, options) => new orig.Minimatch(pattern, ext(def, options));
  return m;
};

Minimatch.defaults = function(def) {
  if (!def || !Object.keys(def).length) return Minimatch;
  return minimatch.defaults(def).Minimatch;
};

Minimatch.prototype.match = function(f, partial) {
  if (this.comment) return false;
  if (this.empty) return f === '';
  if (f === '/' && partial) return true;
  const options = this.options;
  if (path.sep !== '/') f = f.split(path.sep).join('/');
  const set = this.set;
  const filename = f.findLast(seg => seg);
  for (const pattern of set) {
    const file = options.matchBase && pattern.length === 1 ? [filename] : f;
    if (this.matchOne(file, pattern, partial)) return !this.negate;
  }
  return false;
};

Minimatch.prototype.matchOne = function(file, pattern, partial) {
  const options = this.options;
  const fl = file.length, pl = pattern.length;
  for (let fi = 0, pi = 0; fi < fl && pi < pl; fi++, pi++) {
    const p = pattern[pi], f = file[fi];
    if (p === false) return false;
    if (p === GLobStar) {
      if (pattern.slice(pi + 1).some((p) => p !== GLobStar)) {
        for (; fi < fl; fi++) if (['.', '..'].includes(file[fi]) || (!options.dot && file[fi].charAt(0) === '.')) return false;
        return true;
      }
      while (fi < fl) {
        if (this.matchOne(file.slice(fi), pattern.slice(pi + 1), partial)) return true;
        if (['.', '..'].includes(file[fi]) || (!options.dot && file[fi].charAt(0) === '.')) break;
        fi++;
      }
      return partial && fi === fl;
    }
    const hit = (typeof p === 'string') ? (options.nocase ? f.toLowerCase() === p.toLowerCase() : f === p) : f.match(p);
    if (!hit) return false;
  }
  return fi === fl && pi === pl || (fi === fl - 1 && file[fi] === '' && options.matchBase && pattern.length === 1) || (fi === fl && partial);
};

function braceExpand(pattern, options = {}) {
  if (!options.nobrace && pattern.includes('{')) return expand(pattern);
  return [pattern];
}

minimatch.braceExpand = braceExpand;

function parse(pattern, isSub) {
  if (pattern.length > 65536) throw new TypeError('pattern is too long');
  const options = this.options;
  if (!options.noglobstar && pattern === '**') return GLobStar;
  if (pattern === '') return '';
  let re = '', hasMagic = !!options.nocase, escaping = false, inClass = false, stateChar, patternListStack = [], negativeLists = [];
  const patternStart = pattern.charAt(0) === '.' ? '' : (options.dot ? '(?!(?:^|\\/).*?\\/)' : '(?!\\.)');
  for (let i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
    if (escaping && reSpecials.has(c)) {
      re += '\\' + c;
      escaping = false;
      continue;
    }
    switch (c) {
      case '/': return false;
      case '\\': stateChar ? handleStateChar() : (escaping = true); break;
      case '?':
      case '*':
      case '+':
      case '@':
      case '!': handleStateChar(); (stateChar = c) && options.noext && handleStateChar(); break;
      case '(': if (inClass) { re += '('; break; }
        if (!stateChar) { re += '\\('; break; }
        patternListStack.push({ type: stateChar, start: i - 1, reStart: re.length, open: plTypes[stateChar].open, close: plTypes[stateChar].close });
        re += stateChar === '!' ? '(?:(?!' : '(?:'; stateChar = false; break;
      case ')': if (inClass || !patternListStack.length) { re += '\\)'; continue; }
        handleStateChar(); const pl = patternListStack.pop(); pl.reEnd = re.length; re += pl.close; if (pl.type !== '!') continue;
        negativeLists.push(pl); hasMagic = true; continue;
      case '|': if (inClass || !patternListStack.length || escaping) { re += '\\|'; escaping = false; break; }
        handleStateChar(); re += '|'; break;
      case '[': handleStateChar(); inClass = true; re += '['; continue;
      case ']': if (i === classStart + 1 || !inClass) { re += '\\]'; escaping = false; break; }
        if (inClass) { re = re.substr(0, reClassStart) + '\\[' + self.parse(re.substr(reClassStart + 1), true)[0]; inClass = false; break; }
        hasMagic = true; inClass = false; re += ']'; break;
      default: handleStateChar(); escapeRegExpSpecial(c, inClass); re += c;
    }
  }
  re = negativeLists.reduce((prev, nl) => reNegateRegex(prev, nl), re);
  return isSub ? [re, !!hasMagic] : createRegExp(re, hasMagic, options);
}

function handleStateChar() {
  if (!stateChar) return;
  re += stateChar === '*' ? star : stateChar === '?' ? qmark : '\\' + stateChar;
  stateChar = null;
}

function escapeRegExpSpecial(c, inClass) {
  if (!escaping && reSpecials.has(c) && (c !== '^' || !inClass)) re += '\\';
}

function reNegateRegex(prev, nl) {
  const [nlBefore, nlFirst, nlLast, nlAfter = ''] = extractNegateRegexParts(re, nl);
  let cleanAfter = nlAfter;
  return `${nlBefore + nlFirst + cleanAfter.replace(/\)[+*?]?/g, '') + nlAfter + nlLast}`;
}

function extractNegateRegexParts(re, nl) {
  const nlBefore = re.slice(0, nl.reStart);
  const nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
  const nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
  return [nlBefore, nlFirst, nlLast, re.slice(nl.reEnd)];
}

function createRegExp(re, hasMagic, options) {
  return (re === '' || !hasMagic) ? globUnescape(re) : new RegExp(`^${patternStart + re}$`, options.nocase ? 'i' : '');
}

function globUnescape(s) {
  return s.replace(/\\(.)/g, '$1');
}

function regExpEscape(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = minimatch;
minimatch.Minimatch = Minimatch;
