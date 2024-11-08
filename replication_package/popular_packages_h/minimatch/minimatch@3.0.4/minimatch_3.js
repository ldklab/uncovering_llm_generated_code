const path = require('path');
const expand = require('brace-expansion');

module.exports = minimatch;
minimatch.Minimatch = Minimatch;

const GLOBSTAR = {};
const plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
};

const qmark = '[^/]';
const star = qmark + '*?';
const twoStarDot = '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';
const twoStarNoDot = '(?:(?!(?:\\/|^)\\.).)*?';
const reSpecials = charSet('().*{}+?[]^$\\!');

function minimatch(p, pattern, options = {}) {
  if (typeof pattern !== 'string') throw new TypeError('glob pattern string required');
  if (!options.nocomment && pattern.charAt(0) === '#') return false;
  if (pattern.trim() === '') return p === '';
  return new Minimatch(pattern, options).match(p);
}

function Minimatch(pattern, options = {}) {
  if (!(this instanceof Minimatch)) return new Minimatch(pattern, options);
  if (typeof pattern !== 'string') throw new TypeError('glob pattern string required');
  
  this.options = options;
  this.pattern = pattern.trim();
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;

  if (path.sep !== '/') {
    this.pattern = this.pattern.split(path.sep).join('/');
  }

  this.set = [];
  this.make();
}

Minimatch.prototype.make = function() {
  if (this._made) return;

  if (!this.options.nocomment && this.pattern.charAt(0) === '#') {
    this.comment = true;
    return;
  }

  if (!this.pattern) {
    this.empty = true;
    return;
  }

  this.parseNegate();

  const set = this.globSet = this.braceExpand();
  this.globParts = set.map(s => s.split(/\/+/));

  this.set = this.globParts.map(s => s.map(this.parse, this)).filter(s => !s.includes(false));
};

Minimatch.prototype.parseNegate = function() {
  if (this.options.nonegate) return;

  const negateOffset = this.pattern.split('').findIndex(c => c !== '!');
  this.negate = negateOffset % 2 === 1;
  if (negateOffset) this.pattern = this.pattern.substr(negateOffset);
};

Minimatch.prototype.braceExpand = function(pattern = this.pattern, options = this.options) {
  if (options.nobrace || !pattern.match(/\{.*\}/)) return [pattern];
  return expand(pattern);
};

Minimatch.prototype.parse = function(pattern) {
  if (pattern.length > 1024 * 64) throw new TypeError('pattern is too long');
  const options = this.options;
  if (!options.noglobstar && pattern === '**') return GLOBSTAR;
  if (pattern === '') return '';

  let re = '';
  const hasMagic = !!options.nocase;
  const patternListStack = [];
  let escaping = false;
  let inClass = false;
  let classStart = -1;

  for (let i = 0, len = pattern.length; i < len; i++) {
    const c = pattern.charAt(i);

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
        if (!inClass) {
          if (patternListStack.length && patternListStack[patternListStack.length - 1].type) {
            re += '\\' + patternListStack.pop().type;
          }
          patternListStack.push({ type: c, start: i });
        }
        continue;
      case '(':
        if (!inClass) {
          const plType = patternListStack.pop();
          patternListStack.push({ start: i - 1, ...plTypes[plType.type], reStart: re.length });
          re += plType.open;
          continue;
        }
        re += '\\(';
        continue;
      case ')':
        if (!inClass && patternListStack.length) {
          let pl = patternListStack.pop();
          re += pl.close;
          pl.reEnd = re.length;
          hasMagic = true;
          continue;
        }
        re += '\\)';
        continue;
      case '|':
        if (inClass || !patternListStack.length) {
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
        re += c;
        continue;
      case ']':
        if (inClass) {
          inClass = false;
          re += c;
          hasMagic = true;
          continue;
        }
        re += '\\]';
        continue;
      default:
        if (escaping) escaping = false;
        re += (reSpecials[c] ? '\\' + c : c);
    }
  }

  if (inClass) re = re.substr(0, classStart) + '\\[' + re.substr(classStart + 1);
  if (escaping) re += '\\\\';

  if (!hasMagic) {
    return globUnescape(pattern);
  }

  try {
    return new RegExp('^' + re + '$', options.nocase ? 'i' : '');
  } catch (er) {
    return new RegExp('$.');
  }
};

function filter(pattern, options) {
  return function(p) {
    return minimatch(p, pattern, options);
  };
}

function charSet(s) {
  return s.split('').reduce((set, c) => (set[c] = true, set), {});
}

function globUnescape(s) {
  return s.replace(/\\(.)/g, '$1');
}

minimatch.defaults = function(def) {
  if (!def || !Object.keys(def).length) return minimatch;

  const orig = minimatch;

  function m(p, pattern, options) {
    return orig(p, pattern, { ...def, ...options });
  }

  m.Minimatch = function Minimatch(pattern, options) {
    return new orig.Minimatch(pattern, { ...def, ...options });
  };

  return m;
};

minimatch.filter = filter;
minimatch.braceExpand = braceExpand;
minimatch.match = function(list, pattern, options) {
  const mm = new Minimatch(pattern, options);
  list = list.filter(f => mm.match(f));
  if (mm.options.nonull && !list.length) list.push(pattern);
  return list;
};

function matchOne(file, pattern, partial) {
  const options = this.options;

  for (let fi = 0, pi = 0; fi < file.length && pi < pattern.length; fi++, pi++) {
    const p = pattern[pi];

    if (p === GLOBSTAR) {
      if (pi + 1 === pattern.length) {
        for (; fi < file.length; fi++) {
          if (file[fi] === '.' || file[fi] === '..' || (!options.dot && file[fi].charAt(0) === '.')) return false;
        }
        return true;
      }

      while (fi < file.length) {
        if (matchOne.call(this, file.slice(fi), pattern.slice(pi + 1), partial)) return true;
        fi++;
      }
      return partial;
    }

    const f = file[fi];
    const hit = typeof p === 'string' ? options.nocase ? f.toLowerCase() === p.toLowerCase() : f === p : f.match(p);

    if (!hit) return false;
  }

  if (fi === fl && (pi === pl || (pi === pl - 1 && pattern[pi] === ''))) return true;
  if (fi === fl || pi === pl) return partial;
}

// RegExp escape utility
function regExpEscape(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
