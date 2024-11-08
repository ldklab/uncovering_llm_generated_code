'use strict';

const mdurl = require('mdurl');
const ucmicro = require('uc.micro');
const entities = require('entities');
const LinkifyIt = require('linkify-it');
const punycode = require('punycode.js');

function _interopNamespaceDefault(e) {
  const n = Object.create(null);
  if (e) {
    Object.keys(e).forEach((k) => {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : { enumerable: true, get: () => e[k] });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

const mdurl__namespace = _interopNamespaceDefault(mdurl);
const ucmicro__namespace = _interopNamespaceDefault(ucmicro);

// Utility functions
function _class(obj) {
  return Object.prototype.toString.call(obj);
}

function isString(obj) {
  return _class(obj) === '[object String]';
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function assign(obj, ...sources) {
  sources.forEach((source) => {
    if (!source) return;
    if (typeof source !== 'object') throw new TypeError(`${source} must be object`);
    Object.keys(source).forEach((key) => {
      obj[key] = source[key];
    });
  });
  return obj;
}

function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}

function isValidEntityCode(c) {
  // General entity code validation conditions
  if (c >= 0xD800 && c <= 0xDFFF) return false; // Broken sequence
  if (c >= 0xFDD0 && c <= 0xFDEF) return false; // Never used
  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) return false; // Control codes
  if (c >= 0x00 && c <= 0x08 || c === 0x0B || (c >= 0x0E && c <= 0x1F) || (c >= 0x7F && c <= 0x9F) || c > 0x10FFFF) return false; // Control and out of range
  return true;
}

function fromCodePoint(c) {
  if (c > 0xffff) {
    c -= 0x10000;
    const surrogate1 = 0xd800 + (c >> 10);
    const surrogate2 = 0xdc00 + (c & 0x3ff);
    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}

const UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
const ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
const UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');
const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;

function replaceEntityPattern(match, name) {
  if (name.charCodeAt(0) === 0x23 && DIGITAL_ENTITY_TEST_RE.test(name)) {
    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    if (isValidEntityCode(code)) return fromCodePoint(code);
    return match;
  }
  const decoded = entities.decodeHTML(match);
  return decoded !== match ? decoded : match;
}

function unescapeMd(str) {
  return str.indexOf('\\') < 0 ? str : str.replace(UNESCAPE_MD_RE, '$1');
}

function unescapeAll(str) {
  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) return str;
  return str.replace(UNESCAPE_ALL_RE, (match, escaped, entity) => {
    return escaped ? escaped : replaceEntityPattern(match, entity);
  });
}

const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  return HTML_ESCAPE_TEST_RE.test(str) ? str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar) : str;
}

const REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

function escapeRE(str) {
  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
}

function isSpace(code) {
  return code === 0x09 || code === 0x20;
}

function isWhiteSpace(code) {
  if (code >= 0x2000 && code <= 0x200A) return true;
  return code === 0x09 || code === 0x0A || code === 0x0B || code === 0x0C || code === 0x0D || code === 0x20 ||
    code === 0xA0 || code === 0x1680 || code === 0x202F || code === 0x205F || code === 0x3000;
}

function isPunctChar(ch) {
  return ucmicro__namespace.P.test(ch) || ucmicro__namespace.S.test(ch);
}

function isMdAsciiPunct(ch) {
  switch (ch) {
    case 0x21: /* ! */
    case 0x22: /* " */
    case 0x23: /* # */
    case 0x24: /* $ */
    case 0x25: /* % */
    case 0x26: /* & */
    case 0x27: /* ' */
    case 0x28: /* ( */
    case 0x29: /* ) */
    case 0x2A: /* * */
    case 0x2B: /* + */
    case 0x2C: /* , */
    case 0x2D: /* - */
    case 0x2E: /* . */
    case 0x2F: /* / */
    case 0x3A: /* : */
    case 0x3B: /* ; */
    case 0x3C: /* < */
    case 0x3D: /* = */
    case 0x3E: /* > */
    case 0x3F: /* ? */
    case 0x40: /* @ */
    case 0x5B: /* [ */
    case 0x5C: /* \ */
    case 0x5D: /* ] */
    case 0x5E: /* ^ */
    case 0x5F: /* _ */
    case 0x60: /* ` */
    case 0x7B: /* { */
    case 0x7C: /* | */
    case 0x7D: /* } */
    case 0x7E: /* ~ */
      return true;
    default:
      return false;
  }
}

function normalizeReference(str) {
  str = str.trim().replace(/\s+/g, ' ');
  if ('ẞ'.toLowerCase() === 'Ṿ') str = str.replace(/ẞ/g, 'ß');
  return str.toLowerCase().toUpperCase();
}

const lib = { mdurl: mdurl__namespace, ucmicro: ucmicro__namespace };

const utils = Object.freeze({
  arrayReplaceAt,
  assign,
  escapeHtml,
  escapeRE,
  fromCodePoint,
  has,
  isMdAsciiPunct,
  isPunctChar,
  isSpace,
  isString,
  isValidEntityCode,
  isWhiteSpace,
  lib,
  normalizeReference,
  unescapeAll,
  unescapeMd
});

function parseLinkLabel(state, start, disableNested) {
  let level = 1, found = false, marker, prevPos;
  const max = state.posMax;
  const oldPos = state.pos;
  state.pos = start + 1;
  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 0x5D /* ] */) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }
    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 0x5B /* [ */) {
      if (prevPos === state.pos - 1) {
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }
  state.pos = oldPos;
  return found ? state.pos : -1;
}

function parseLinkDestination(str, start, max) {
  let pos = start, code;
  const result = { ok: false, pos: 0, str: '' };

  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++;
    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === 0x0A /* \n */) return result;
      if (code === 0x3C /* < */) return result;
      if (code === 0x3E /* > */) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      pos = (code === 0x5C /* \ */ && pos + 1 < max) ? pos + 2 : pos + 1;
    }
    return result;
  }

  let level = 0;
  while (pos < max) {
    code = str.charCodeAt(pos);
    if (code === 0x20) break;
    if (code < 0x20 || code === 0x7F) break;
    if (code === 0x5C /* \ */ && pos + 1 < max) {
      if (str.charCodeAt(pos + 1) === 0x20) break;
      pos += 2;
      continue;
    }
    if (code === 0x28 /* ( */) {
      level++;
      if (level > 32) return result;
    }
    if (code === 0x29 /* ) */) {
      if (level === 0) break;
      level--;
    }
    pos++;
  }
  result.str = unescapeAll(str.slice(start, pos));
  result.ok = level === 0;
  return result;
}

function parseLinkTitle(str, start, max, prev_state) {
  let code;
  let pos = start;
  const state = prev_state || { ok: false, pos: 0, str: '', marker: 0 };

  let marker = state.marker || str.charCodeAt(pos);
  if (!prev_state) {
    if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) return state;
    start++;
    pos++;
    marker = (marker === 0x28) ? 0x29 : marker;
    state.marker = marker;
  }
  while (pos < max) {
    code = str.charCodeAt(pos);
    if (code === state.marker) {
      state.pos = pos + 1;
      state.str += unescapeAll(str.slice(start, pos));
      state.ok = true;
      return state;
    } else if (code === 0x28 /* ( */ && state.marker === 0x29 /* ) */) {
      return state;
    } else if (code === 0x5C /* \ */ && pos + 1 < max) pos++;
    pos++;
  }
  state.can_continue = true;
  state.str += unescapeAll(str.slice(start, pos));
  return state;
}

const helpers = Object.freeze({
  parseLinkDestination,
  parseLinkLabel,
  parseLinkTitle
});

const default_rules = {
  code_inline(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return '<code' + slf.renderAttrs(token) + '>' + escapeHtml(token.content) + '</code>';
  },
  code_block(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    return '<pre' + slf.renderAttrs(token) + '><code>' + escapeHtml(token.content) + '</code></pre>\n';
  },
  fence(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : '';
    let langName = '';
    let langAttrs = '';
    if (info) {
      const arr = info.split(/(\s+)/g);
      langName = arr[0];
      langAttrs = arr.slice(2).join('');
    }
    const highlighted = options.highlight ? options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content) : escapeHtml(token.content);
    if (highlighted.indexOf('<pre') === 0) return highlighted + '\n';

    const i = token.attrIndex('class');
    const tmpAttrs = token.attrs ? token.attrs.slice() : [];
    if (i < 0) {
      tmpAttrs.push(['class', options.langPrefix + langName]);
    } else {
      tmpAttrs[i] = tmpAttrs[i].slice();
      tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
    }
    const tmpToken = { attrs: tmpAttrs };
    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`;
  },
  image(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    token.attrs[token.attrIndex('alt')][1] = slf.renderInlineAsText(token.children, options, env);
    return slf.renderToken(tokens, idx, options);
  },
  hardbreak(tokens, idx, options) {
    return options.xhtmlOut ? '<br />\n' : '<br>\n';
  },
  softbreak(tokens, idx, options) {
    return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
  },
  text(tokens, idx) {
    return escapeHtml(tokens[idx].content);
  },
  html_block(tokens, idx) {
    return tokens[idx].content;
  },
  html_inline(tokens, idx) {
    return tokens[idx].content;
  }
};

function Renderer() {
  this.rules = assign({}, default_rules);
}

Renderer.prototype.renderAttrs = function renderAttrs(token) {
  if (!token.attrs) return '';
  return token.attrs.reduce((result, [name, value]) => `${result} ${escapeHtml(name)}="${escapeHtml(value)}"`, '');
};

Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
  const token = tokens[idx];
  if (token.hidden) return '';
  let result = token.block && idx && tokens[idx - 1].hidden ? '\n' : '';
  result += (token.nesting === -1 ? '</' : '<') + token.tag;
  result += this.renderAttrs(token);
  if (token.nesting === 0 && options.xhtmlOut) result += ' /';
  const needLf = token.block && token.nesting !== -1 && (idx + 1 < tokens.length && !(['inline', 'hidden'].includes(tokens[idx + 1].type) && tokens[idx + 1].type !== token.tag));
  return result + (needLf ? '>\n' : '>');
};

Renderer.prototype.renderInline = function (tokens, options, env) {
  const rules = this.rules;
  return tokens.reduce((result, { type }, i) => result + (rules[type] ? rules[type](tokens, i, options, env, this) : this.renderToken(tokens, i, options)), '');
};

Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
  return tokens.reduce((result, token) => {
    if (token.type === 'text' || token.type === 'html_inline' || token.type === 'html_block') {
      result += token.content;
    } else if (token.type === 'image') {
      result += this.renderInlineAsText(token.children, options, env);
    } else if (token.type === 'softbreak' || token.type === 'hardbreak') {
      result += '\n';
    }
    return result;
  }, '');
};

Renderer.prototype.render = function (tokens, options, env) {
  const rules = this.rules;
  return tokens.reduce((result, token, i) => {
    if (token.type === 'inline') {
      result += this.renderInline(token.children, options, env);
    } else {
      result += (rules[token.type] ? rules[token.type](tokens, i, options, env, this) : this.renderToken(tokens, i, options, env));
    }
    return result;
  }, '');
};

function Ruler() {
  this.__rules__ = [];
  this.__cache__ = null;
}

Ruler.prototype.__find__ = function (name) {
  return this.__rules__.findIndex(({ name: ruleName }) => ruleName === name);
};

Ruler.prototype.__compile__ = function () {
  const chains = [''];
  this.__rules__.forEach(({ enabled, alt }) => {
    if (!enabled) return;
    alt.forEach((altName) => {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });
  this.__cache__ = {};
  chains.forEach((chain) => {
    this.__cache__[chain] = this.__rules__.filter(({ enabled, alt }) => enabled && (!chain || alt.includes(chain))).map(({ fn }) => fn);
  });
};

Ruler.prototype.at = function (name, fn, options = {}) {
  const index = this.__find__(name);
  if (index === -1) {
    throw new Error(`Parser rule not found: ${name}`);
  }
  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = options.alt || [];
  this.__cache__ = null;
};

Ruler.prototype.before = function (beforeName, ruleName, fn, options = {}) {
  const index = this.__find__(beforeName);
  if (index === -1) {
    throw new Error(`Parser rule not found: ${beforeName}`);
  }
  this.__rules__.splice(index, 0, { name: ruleName, enabled: true, fn, alt: options.alt || [] });
  this.__cache__ = null;
};

Ruler.prototype.after = function (afterName, ruleName, fn, options = {}) {
  const index = this.__find__(afterName);
  if (index === -1) {
    throw new Error(`Parser rule not found: ${afterName}`);
  }
  this.__rules__.splice(index + 1, 0, { name: ruleName, enabled: true, fn, alt: options.alt || [] });
  this.__cache__ = null;
};

Ruler.prototype.push = function (ruleName, fn, options = {}) {
  this.__rules__.push({ name: ruleName, enabled: true, fn, alt: options.alt || [] });
  this.__cache__ = null;
};

Ruler.prototype.enable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) {
    list = [list];
  }
  const result = [];
  list.forEach((name) => {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) return;
      throw new Error(`Rules manager: invalid rule name ${name}`);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  });
  this.__cache__ = null;
  return result;
};

Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) {
    list = [list];
  }
  this.__rules__.forEach((rule) => rule.enabled = false);
  this.enable(list, ignoreInvalid);
};

Ruler.prototype.disable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) {
    list = [list];
  }
  const result = [];
  list.forEach((name) => {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) return;
      throw new Error(`Rules manager: invalid rule name ${name}`);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  });
  this.__cache__ = null;
  return result;
};

Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }
  return this.__cache__[chainName] || [];
};

function Token(type, tag, nesting) {
  this.type = type;
  this.tag = tag;
  this.attrs = null;
  this.map = null;
  this.nesting = nesting;
  this.level = 0;
  this.children = null;
  this.content = '';
  this.markup = '';
  this.info = '';
  this.meta = null;
  this.block = false;
  this.hidden = false;
}

Token.prototype.attrIndex = function attrIndex(name) {
  if (!this.attrs) return -1;
  return this.attrs.findIndex((attr) => attr[0] === name);
};

Token.prototype.attrPush = function attrPush(attrData) {
  if (this.attrs) {
    this.attrs.push(attrData);
  } else {
    this.attrs = [attrData];
  }
};

Token.prototype.attrSet = function attrSet(name, value) {
  const idx = this.attrIndex(name);
  const attrData = [name, value];
  if (idx < 0) {
    this.attrPush(attrData);
  } else {
    this.attrs[idx] = attrData;
  }
};

Token.prototype.attrGet = function attrGet(name) {
  const idx = this.attrIndex(name);
  return idx >= 0 ? this.attrs[idx][1] : null;
};

Token.prototype.attrJoin = function attrJoin(name, value) {
  const idx = this.attrIndex(name);
  if (idx < 0) {
    this.attrPush([name, value]);
  } else {
    this.attrs[idx][1] += ` ${value}`;
  }
};

function StateCore(src, md, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md;
}

StateCore.prototype.Token = Token;

const NEWLINES_RE = /\r\n?|\n/g;
const NULL_RE = /\0/g;

function normalize(state) {
  state.src = state.src.replace(NEWLINES_RE, '\n').replace(NULL_RE, '\uFFFD');
}

function block(state) {
  const token = state.inlineMode
    ? new state.Token('inline', '', 0)
    : state.md.block.parse(state.src, state.md, state.env, state.tokens);
  if (state.inlineMode) {
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
  }
}

function inline(state) {
  state.tokens.forEach((token) => {
    if (token.type === 'inline') {
      state.md.inline.parse(token.content, state.md, state.env, token.children);
    }
  });
}

function isLinkOpen$1(str) {
  return /^<a[>\s]/i.test(str);
}

function isLinkClose$1(str) {
  return /^<\/a\s*>/i.test(str);
}

function linkify$1(state) {
  if (!state.md.options.linkify) return;

  state.tokens.forEach((blockToken, j) => {
    if (blockToken.type !== 'inline' || !state.md.linkify.pretest(blockToken.content)) return;

    const tokens = blockToken.children;
    let htmlLinkLevel = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const currentToken = tokens[i];
      if (currentToken.type === 'link_close') {
        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') i--;
        continue;
      }
      if (currentToken.type === 'html_inline') {
        if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) htmlLinkLevel--;
        if (isLinkClose$1(currentToken.content)) htmlLinkLevel++;
      }
      if (htmlLinkLevel > 0) continue;

      if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {
        const text = currentToken.content;
        let links = state.md.linkify.match(text);
        const nodes = [];
        let level = currentToken.level;
        let lastPos = 0;
        if (links.length > 0 && links[0].index === 0 && i > 0 && tokens[i - 1].type === 'text_special') {
          links = links.slice(1);
        }
        links.forEach((link) => {
          const url = link.url;
          const fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) return;
          let urlText = link.text;
          if (!link.schema) {
            urlText = state.md.normalizeLinkText(`http://${urlText}`).replace(/^http:\/\//, '');
          } else if (link.schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText(`mailto:${urlText}`).replace(/^mailto:/, '');
          } else {
            urlText = state.md.normalizeLinkText(urlText);
          }
          const pos = link.index;
          if (pos > lastPos) {
            const token = new state.Token('text', '', 0);
            token.content = text.slice(lastPos, pos);
            token.level = level;
            nodes.push(token);
          }
          const token_o = new state.Token('link_open', 'a', 1);
          token_o.attrs = [['href', fullUrl]];
          token_o.level = level++;
          token_o.markup = 'linkify';
          token_o.info = 'auto';
          nodes.push(token_o);
          const token_t = new state.Token('text', '', 0);
          token_t.content = urlText;
          token_t.level = level;
          nodes.push(token_t);
          const token_c = new state.Token('link_close', 'a', -1);
          token_c.level = --level;
          token_c.markup = 'linkify';
          token_c.info = 'auto';
          nodes.push(token_c);
          lastPos = link.lastIndex;
        });
        if (lastPos < text.length) {
          const token = new state.Token('text', '', 0);
          token.content = text.slice(lastPos);
          token.level = level;
          nodes.push(token);
        }
        blockToken.children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  });
}

const RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
const SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
const SCOPED_ABBR_RE = /\((c|tm|r)\)/ig;
const SCOPED_ABBR = { c: '©', r: '®', tm: '™' };

function replaceFn(match, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}

function replace_scoped(inlineTokens) {
  let inside_autolink = 0;
  inlineTokens.reverse().forEach((token) => {
    if (token.type === 'text' && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }
    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }
    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  });
}

function replace_rare(inlineTokens) {
  let inside_autolink = 0;
  inlineTokens.reverse().forEach((token) => {
    if (token.type === 'text' && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content.replace(/\+-/g, '±')
          .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
          .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
          .replace(/(^|[^-])---(?=[^-]|$)/mg, '$1\u2014')
          .replace(/(^|\s)--(?=\s|$)/mg, '$1\u2013').replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, '$1\u2013');
      }
    }
    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }
    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  });
}

function replace(state) {
  if (!state.md.options.typographer) return;

  state.tokens.reverse().forEach((token) => {
    if (token.type !== 'inline') return;
    if (SCOPED_ABBR_TEST_RE.test(token.content)) {
      replace_scoped(token.children);
    }
    if (RARE_RE.test(token.content)) {
      replace_rare(token.children);
    }
  });
}

const QUOTE_TEST_RE = /['"]/;
const QUOTE_RE = /['"]/g;
const APOSTROPHE = '\u2019'; /* ’ */

function replaceAt(str, index, ch) {
  return str.slice(0, index) + ch + str.slice(index + 1);
}

function process_inlines(tokens, state) {
  const stack = [];
  tokens.forEach((token, i) => {
    for (let j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= token.level) {
        break;
      }
      stack.length = j + 1;
    }

    if (token.type !== 'text') return;

    let text = token.content;
    let pos = 0;
    let max = text.length;

    while (pos < max) {
      QUOTE_RE.lastIndex = pos;
      const t = QUOTE_RE.exec(text);
      if (!t) break;

      let canOpen = true;
      let canClose = true;
      pos = t.index + 1;
      const isSingle = t[0] === "'";

      let lastChar = 0x20;
      if (t.index - 1 >= 0) {
        lastChar = text.charCodeAt(t.index - 1);
      } else {
        for (let j = i - 1; j >= 0; j--) {
          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break;
          if (!tokens[j].content) continue;
          lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
          break;
        }
      }

      let nextChar = 0x20;
      if (pos < max) {
        nextChar = text.charCodeAt(pos);
      } else {
        for (let j = i + 1; j < tokens.length; j++) {
          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break;
          if (!tokens[j].content) continue;
          nextChar = tokens[j].content.charCodeAt(0);
          break;
        }
      }

      const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
      const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
      const isLastWhiteSpace = isWhiteSpace(lastChar);
      const isNextWhiteSpace = isWhiteSpace(nextChar);

      if (isNextWhiteSpace) {
        canOpen = false;
      } else if (isNextPunctChar) {
        if (!(isLastWhiteSpace || isLastPunctChar)) {
          canOpen = false;
        }
      }

      if (isLastWhiteSpace) {
        canClose = false;
      } else if (isLastPunctChar) {
        if (!(isNextWhiteSpace || isNextPunctChar)) {
          canClose = false;
        }
      }

      if (nextChar === 0x22 && t[0] === '"') {
        if (lastChar >= 0x30 && lastChar <= 0x39) {
          canClose = canOpen = false;
        }
      }

      if (canOpen && canClose) {
        canOpen = isLastPunctChar;
        canClose = isNextPunctChar;
      }

      if (!canOpen && !canClose) {
        if (isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
        continue;
      }

      if (canClose) {
        for (let j = stack.length - 1; j >= 0; j--) {
          let item = stack[j];
          if (stack[j].level < token.level) {
            break;
          }
          if (item.single === isSingle && stack[j].level === token.level) {
            item = stack[j];

            const openQuote = isSingle ? state.md.options.quotes[2] : state.md.options.quotes[0];
            const closeQuote = isSingle ? state.md.options.quotes[3] : state.md.options.quotes[1];

            token.content = replaceAt(token.content, t.index, closeQuote);
            tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote);

            pos += closeQuote.length - 1;
            if (item.token === i) {
              pos += openQuote.length - 1;
            }
            text = token.content;
            max = text.length;

            stack.length = j;
            continue;
          }
        }
      }

      if (canOpen) {
        stack.push({ token: i, pos: t.index, single: isSingle, level: token.level });
      } else if (canClose && isSingle) {
        token.content = replaceAt(token.content, t.index, APOSTROPHE);
      }
    }
  });
}

function smartquotes(state) {
  if (!state.md.options.typographer) return;

  state.tokens.reverse().forEach((token) => {
    if (token.type !== 'inline' || !QUOTE_TEST_RE.test(token.content)) return;
    process_inlines(token.children, state);
  });
}

function text_join(state) {
  state.tokens.forEach((blockToken) => {
    if (blockToken.type !== 'inline') return;
    
    blockToken.children.forEach((token) => {
      if (token.type === 'text_special') {
        token.type = 'text';
      }
    });

    const tokens = blockToken.children;
    for (let curr = 0, last = 0; curr < tokens.length; curr++) {
      if (tokens[curr].type === 'text' && curr + 1 < tokens.length && tokens[curr + 1].type === 'text') {
        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      } else {
        if (curr !== last) {
          tokens[last] = tokens[curr];
        }
        last++;
      }
    }

    if (tokens.length !== blockToken.children.length) {
      blockToken.children.length = tokens.length;
    }
  });
}

const _rules$2 = [
  ['normalize', normalize],
  ['block', block],
  ['inline', inline],
  ['linkify', linkify$1],
  ['replacements', replace],
  ['smartquotes', smartquotes],
  ['text_join', text_join]
];

function Core() {
  this.ruler = new Ruler();
  _rules$2.forEach(([name, fn]) => this.ruler.push(name, fn));
}

Core.prototype.process = function (state) {
  this.ruler.getRules('').forEach((rule) => rule(state));
};

Core.prototype.State = StateCore;

function StateBlock(src, md, env, tokens) {
  this.src = src;
  this.md = md;
  this.env = env;
  this.tokens = tokens;
  this.bMarks = [];
  this.eMarks = [];
  this.tShift = [];
  this.sCount = [];
  this.bsCount = [];

  this.blkIndent = 0;
  this.line = 0;
  this.lineMax = 0;
  this.tight = false;
  this.ddIndent = -1;
  this.listIndent = -1;

  this.parentType = 'root';
  this.level = 0;

  this.initCaches();
}

StateBlock.prototype.initCaches = function () {
  const s = this.src;
  let start = 0;
  let pos = 0;
  let indent = 0;
  let offset = 0;
  let len = s.length;
  let indent_found = false;

  for (; pos < len; pos++) {
    const ch = s.charCodeAt(pos);

    if (!indent_found) {
      if (isSpace(ch)) {
        if (ch === 0x09) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
        indent++;
        continue;
      } else {
        indent_found = true;
      }
    }

    if (ch === 0x0A || pos === len - 1) {
      if (ch !== 0x0A) {
        pos++;
      }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      this.sCount.push(offset);
      this.bsCount.push(0);

      indent_found = false;
      indent = 0;
      offset = 0;
      start = pos + 1;
    }
  }

  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.sCount.push(0);
  this.bsCount.push(0);
  this.lineMax = this.bMarks.length - 1;
}

// Push new token to "stream".
StateBlock.prototype.push = function (type, tag, nesting) {
  const token = new Token(type, tag, nesting);
  token.block = true;
  if (nesting < 0) this.level--; // closing tag
  token.level = this.level;
  if (nesting > 0) this.level++; // opening tag
  this.tokens.push(token);
  return token;
};

StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};

StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (let max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};

StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (let max = this.src.length; pos < max; pos++) {
    if (!isSpace(this.src.charCodeAt(pos))) {
      break;
    }
  }
  return pos;
};

StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
  if (pos <= min) return pos;
  while (pos > min) {
    if (!isSpace(this.src.charCodeAt(--pos))) {
      return pos + 1;
    }
  }
  return pos;
};

StateBlock.prototype.skipChars = function skipChars(pos, code) {
  for (let max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code) {
      break;
    }
  }
  return pos;
};

StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
  if (pos <= min) return pos;
  while (pos > min) {
    if (code !== this.src.charCodeAt(--pos)) {
      return pos + 1;
    }
  }
  return pos;
};

StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  if (begin >= end) return '';

  const queue = new Array(end - begin);
  for (let i = 0, line = begin; line < end; line++, i++) {
    let lineIndent = 0;
    const lineStart = this.bMarks[line];
    let first = lineStart;
    let last;

    if (line + 1 < end || keepLastLF) {
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }

    while (first < last && lineIndent < indent) {
      const ch = this.src.charCodeAt(first);
      if (isSpace(ch)) {
        if (ch === 0x09) {
          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
        } else {
          lineIndent++;
        }
      } else if (first - lineStart < this.tShift[line]) {
        lineIndent++;
      } else {
        break;
      }
      first++;
    }

    if (lineIndent > indent) {
      queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
    } else {
      queue[i] = this.src.slice(first, last);
    }
  }

  return queue.join('');
};

// re-export Token class to use in block rules
StateBlock.prototype.Token = Token;

function tokenFactory(type, tag, nesting, block) {
  const token = new Token(type, tag, nesting);
  token.block = block;
  return token;
}

function table(state, startLine, endLine, silent) {
  if (startLine + 2 > endLine) return false;

  let nextLine = startLine + 1;
  if (state.sCount[nextLine] < state.blkIndent) return false;
  if (state.sCount[nextLine] - state.blkIndent >= 4) return false;

  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
  let max = state.eMarks[nextLine];

  if (pos >= max) return false;

  const firstCh = state.src.charCodeAt(pos++);
  if (firstCh !== 0x7C && firstCh !== 0x2D && firstCh !== 0x3A) return false;

  if (pos < max) {
    const secondCh = state.src.charCodeAt(pos++);
    if (secondCh !== 0x7C && secondCh !== 0x2D && secondCh !== 0x3A && !isSpace(secondCh)) return false;
  }

  if (firstCh === 0x2D && isSpace(state.src.charCodeAt(pos - 1))) return false;

  while (pos < max) {
    if (![0x7C, 0x2D, 0x3A].includes(state.src.charCodeAt(pos)) && !isSpace(state.src.charCodeAt(pos))) return false;
    pos++;
  }

  let lineText = getLine(state, startLine + 1);
  let columns = lineText.split('|');
  const aligns = columns.map((t) => {
    t = t.trim();
    if (!t) return null;

    if (!/^:?-+:?$/.test(t)) return null;
    if (t.charCodeAt(t.length - 1) === 0x3A) return t.charCodeAt(0) === 0x3A ? 'center' : 'right';
    return t.charCodeAt(0) === 0x3A ? 'left' : '';
  });

  if (lineText.indexOf('|') === -1) return false;
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;

  columns = escapedSplit(getLine(state, startLine).trim()).filter(Boolean);
  const columnCount = columns.length;
  if (columnCount === 0 || columnCount !== aligns.length) return false;

  if (silent) return true;

  const oldParentType = state.parentType;
  state.parentType = 'table';

  const terminatorRules = state.md.block.ruler.getRules('blockquote');
  const lines = [startLine, 0];
  const token_to = tokenFactory('table_open', 'table', 1);
  token_to.map = lines;
  state.push(token_to);

  const token_tho = tokenFactory('thead_open', 'thead', 1);
  token_tho.map = [startLine, startLine + 1];
  state.push(token_tho);

  const token_htro = tokenFactory('tr_open', 'tr', 1);
  token_htro.map = [startLine, startLine + 1];
  state.push(token_htro);

  columns.forEach((column, i) => {
    const token_ho = tokenFactory('th_open', 'th', 1);
    if (aligns[i]) {
      token_ho.attrs = [['style', `text-align:${aligns[i]}`]];
    }
    state.push(token_ho);

    const token_il = tokenFactory('inline', '', 0);
    token_il.content = column.trim();
    token_il.children = [];
    state.push(token_il);
    state.push(tokenFactory('th_close', 'th', -1));
  });

  state.push(tokenFactory('tr_close', 'tr', -1));
  state.push(tokenFactory('thead_close', 'thead', -1));

  let tbodyLines;
  let autocompletedCells = 0;

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) break;
    if (terminatorRules.some((rule) => rule(state, nextLine, endLine, true))) break;

    lineText = getLine(state, nextLine).trim();
    if (!lineText) break;
    if (state.sCount[nextLine] - state.blkIndent >= 4) break;

    columns = escapedSplit(lineText).filter(Boolean);
    autocompletedCells += columnCount - columns.length;

    if (autocompletedCells > 0x10000) break;

    if (nextLine === startLine + 2) {
      const token_tbo = tokenFactory('tbody_open', 'tbody', 1);
      token_tbo.map = tbodyLines = [startLine + 2, 0];
      state.push(token_tbo);
    }

    const token_tro = tokenFactory('tr_open', 'tr', 1);
    token_tro.map = [nextLine, nextLine + 1];
    state.push(token_tro);

    columns = columns.concat(Array(columnCount - columns.length).fill(''));
    columns.forEach((column, i) => {
      const token_tdo = tokenFactory('td_open', 'td', 1);
      if (aligns[i]) {
        token_tdo.attrs = [['style', `text-align:${aligns[i]}`]];
      }
      state.push(token_tdo);

      const token_il = tokenFactory('inline', '', 0);
      token_il.content = column.trim();
      token_il.children = [];
      state.push(token_il);
      state.push(tokenFactory('td_close', 'td', -1));
    });
    state.push(tokenFactory('tr_close', 'tr', -1));
  }

  if (tbodyLines) {
    state.push(tokenFactory('tbody_close', 'tbody', -1));
    tbodyLines[1] = nextLine;
  }

  state.push(tokenFactory('table_close', 'table', -1));
  lines[1] = nextLine;
  state.parentType = oldParentType;
  state.line = nextLine;
  return true;
}

function escapedSplit(str) {
  const result = [];
  const max = str.length;
  let pos = 0;
  let isEscaped = false;
  let lastPos = 0;
  let current = '';

  while (pos < max) {
    if (str.charCodeAt(pos) === 0x7c && !isEscaped) {
      result.push(current + str.substring(lastPos, pos));
      current = '';
      lastPos = pos + 1;
    } else {
      current += isEscaped ? str.substring(lastPos, pos - 1) : '';
      lastPos = pos;
    }
    isEscaped = str.charCodeAt(pos++) === 0x5c;
  }

  result.push(current + str.substring(lastPos));
  return result;
}

const getLine = (state, line) => {
  const pos = state.bMarks[line] + state.tShift[line];
  const max = state.eMarks[line];
  return state.src.slice(pos, max);
}

function code(state, startLine, endLine) {
  if (state.sCount[startLine] - state.blkIndent < 4) return false;

  let nextLine = startLine + 1;
  let last = nextLine;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      last = ++nextLine;
      continue;
    }
    break;
  }

  state.line = last;

  const token = state.push('code_block', 'code', 0);
  token.content = state.getLines(startLine, last, state.blkIndent + 4, false) + '\n';
  token.map = [startLine, state.line];
  return true;
}

function fence(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (pos + 3 > max) return false;

  const marker = state.src.charCodeAt(pos);
  if (marker !== 0x7E && marker !== 0x60) return false;

  pos = state.skipChars(pos, marker);

  const len = pos - (state.bMarks[startLine] + state.tShift[startLine]);
  if (len < 3) return false;

  const markup = state.src.slice(state.bMarks[startLine] + state.tShift[startLine], pos);
  const params = state.src.slice(pos, max);

  if (marker === 0x60 && params.includes(String.fromCharCode(marker))) return false;
  if (silent) return true;

  let nextLine = startLine;
  let haveEndMarker = false;

  for (;;) {
    if (++nextLine >= endLine) break;

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    if (state.src.charCodeAt(pos) !== marker) {
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      continue;
    }
    pos = state.skipChars(pos, marker);
    if (pos - (state.bMarks[nextLine] + state.tShift[nextLine]) < len) {
      continue;
    }
    if (state.skipSpaces(pos) < max) {
      continue;
    }
    haveEndMarker = true;
    break;
  }

  const contentStart = startLine + 1;
  state.line = nextLine + (haveEndMarker ? 1 : 0);

  const token = state.push('fence', 'code', 0);
  token.info = params;
  token.content = state.getLines(contentStart, nextLine, state.sCount[contentStart], true);
  token.markup = markup;
  token.map = [startLine, state.line];

  return true;
}

function blockquote(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (state.src.charCodeAt(pos) !== 0x3E) return false;
  if (silent) return true;

  const oldParentType = state.parentType;
  state.parentType = 'blockquote';

  const oldBMarks = [];
  const oldBSCount = [];
  const oldSCount = [];
  const oldTShift = [];
  const terminatorRules = state.md.block.ruler.getRules('blockquote');

  let succeed = false;
  let lastLineEmpty = false;
  let nextLine;

  for (nextLine = startLine; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) break;

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos >= max) {
      break;
    }
    if (state.src.charCodeAt(pos++) === 0x3E && state.sCount[nextLine] >= state.blkIndent) {
      if (state.src.charCodeAt(pos) === 0x20) pos++;

      oldBMarks.push(state.bMarks[nextLine]);
      oldBSCount.push(state.bsCount[nextLine]);
      oldSCount.push(state.sCount[nextLine]);
      oldTShift.push(state.tShift[nextLine]);

      state.bMarks[nextLine] = pos;
      state.bsCount[nextLine] = state.sCount[nextLine] + 1;
      state.sCount[nextLine] = pos - (state.bMarks[nextLine] + state.tShift[nextLine]);

      state.tShift[nextLine] = pos - state.bMarks[nextLine];

      lastLineEmpty = pos >= max;

      succeed = true;
      continue;
    }

    if (lastLineEmpty || terminatorRules.some((rule) => rule(state, nextLine, endLine, true))) break;

    lastLineEmpty = state.isEmpty(nextLine);
    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);
    state.sCount[nextLine] = -1;
  }

  if (!succeed) return false;

  const token_o = state.push('blockquote_open', 'blockquote', 1);
  token_o.markup = '>';
  token_o.map = [startLine, nextLine];

  state.md.block.tokenize(state, startLine, nextLine);
  state.push('blockquote_close', 'blockquote', -1).markup = '>';

  for (let i = 0; i < oldTShift.length; i++) {
    const line = i + startLine;
    state.bMarks[line] = oldBMarks[i];
    state.tShift[line] = oldTShift[i];
    state.sCount[line] = oldSCount[i];
    state.bsCount[line] = oldBSCount[i];
  }

  state.parentType = oldParentType;
  state.line = nextLine;

  return true;
}

function hr(state, startLine, endLine, silent) {
  const max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;

  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);

  if (![0x2A, 0x2D, 0x5F].includes(marker)) return false;

  let cnt = 1;
  while (pos < max) {
    const ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) return false;
    if (ch !== marker) continue;
    cnt++;
  }

  if (cnt < 3) return false;
  if (silent) return true;

  state.line = startLine + 1;
  const token = state.push('hr', 'hr', 0);
  token.map = [startLine, state.line];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

  return true;
}

function skipBulletListMarker(state, startLine) {
  const max = state.eMarks[startLine];
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  if (![0x2A, 0x2D, 0x2B].includes(state.src.charCodeAt(pos))) return -1;

  if (pos < max && !isSpace(state.src.charCodeAt(pos + 1))) return -1;

  return pos + 1;
}

function skipOrderedListMarker(state, startLine) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  let pos = start;

  if (pos + 1 >= max) return -1;

  let ch = state.src.charCodeAt(pos++);
  if (ch < 0x30 || ch > 0x39) return -1;

  for (; pos < max; pos++) {
    ch = state.src.charCodeAt(pos);
    if (ch >= 0x30 && ch <= 0x39) {
      if (pos - start >= 10) return -1;
      continue;
    }
    if ([0x29, 0x2e].includes(ch)) break;

    return -1;
  }

  if (!isSpace(state.src.charCodeAt(pos)) && pos < max) return -1;

  return pos + 1;
}

function list(state, startLine, endLine, silent) {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (state.listIndent >= 0 && state.sCount[startLine] - state.listIndent >= 4 && state.sCount[startLine] < state.blkIndent) return false;

  const isTerminating = silent && state.parentType === 'paragraph' && state.sCount[startLine] >= state.blkIndent;
  let isOrdered;
  let markerValue;
  let posAfterMarker = skipOrderedListMarker(state, startLine);
  if (posAfterMarker >= 0) {
    isOrdered = true;
    const start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.slice(start, posAfterMarker - 1));

    if (isTerminating && markerValue !== 1) return false;
  } else {
    posAfterMarker = skipBulletListMarker(state, startLine);
    if (posAfterMarker < 0) return false;
    isOrdered = false;
  }

  if (isTerminating) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[startLine]) return false;
  }

  if (silent) return true;

  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
  const listTokIdx = state.tokens.length;

  const token = isOrdered ? state.push('ordered_list_open', 'ol', 1) : state.push('bullet_list_open', 'ul', 1);
  const listLines = [startLine, 0];
  token.map = listLines;
  token.markup = String.fromCharCode(markerCharCode);

  if (isOrdered && markerValue !== 1) {
    token.attrs = [['start', markerValue]];
  }

  const oldParentType = state.parentType;
  state.parentType = 'list';

  const terminatorRules = state.md.block.ruler.getRules('list');
  let nextLine = startLine;
  let prevEmptyEnd = false;
  let tight = true;

  while (nextLine < endLine) {
    const max = state.eMarks[nextLine];
    const initial = state.sCount[nextLine] + posAfterMarker - state.bMarks[nextLine] - state.tShift[nextLine];
    const offset = initial + state.sCount[nextLine];

    let pos = posAfterMarker;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos);
      if (ch === 0x09) pos += 4 - (offset + state.bsCount[nextLine] % 4);
      else if (ch !== 0x20) break;
      else pos++;
    }

    const contentStart = pos;
    const indentAfterMarker = contentStart >= max ? 1 : offset - initial;
    const indent = initial + indentAfterMarker > 4 ? 1 : initial + indentAfterMarker;
    const itemLines = [nextLine, 0];

    const oldTight = state.tight;
    const oldTShift = state.tShift[nextLine];
    const oldSCount = state.sCount[nextLine];

    const oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;
    state.tight = true;
    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
    state.sCount[nextLine] = offset;

    const token = state.push('list_item_open', 'li', 1);
    token.markup = String.fromCharCode(markerCharCode);
    token.map = itemLines;

    if (isOrdered) token.info = state.src.slice(state.bMarks[startLine], posAfterMarker - 1);

    if (contentStart >= max && state.isEmpty(nextLine + 1)) {
      state.line = Math.min(state.line + 2, endLine);
    } else {
      state.md.block.tokenize(state, nextLine, endLine, true);
    }

    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }

    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);

    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[nextLine] = oldTShift;
    state.sCount[nextLine] = oldSCount;
    state.tight = oldTight;

    nextLine = state.line;
    itemLines[1] = nextLine;

    if (state.line >= endLine) {
      break;
    }

    if (state.sCount[nextLine] < state.blkIndent) break;
    if (state.sCount[nextLine] - state.blkIndent >= 4) break;

    if (terminatorRules.some((rule) => rule(state, nextLine, endLine, true))) break;

    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) break;
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) break;
    }
    
    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) break;
  }

  const listCloseToken = isOrdered ? state.push('ordered_list_close', 'ol', -1) : state.push('bullet_list_close', 'ul', -1);
  listCloseToken.markup = String.fromCharCode(markerCharCode);
  listLines[1] = state.line;

  state.parentType = oldParentType;

  if (tight) markTightParagraphs(state, listTokIdx);

  return true;
}

function markTightParagraphs(state, idx) {
  const level = state.level + 2;
  for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].hidden = true;
      state.tokens[i].hidden = true;
      i += 2;
    }
  }
}

function reference(state, startLine, _endLine, silent) {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (state.src.charCodeAt(state.bMarks[startLine] + state.tShift[startLine]) !== 0x5B) return false;

  const getNextLine = (nextLine) => {
    const endLine = state.lineMax;
    if (nextLine >= endLine || state.isEmpty(nextLine)) return null;

    const terminatorRules = state.md.block.ruler.getRules('reference');
    const oldParentType = state.parentType;
    state.parentType = 'reference';

    if (state.sCount[nextLine] - state.blkIndent > 3 || state.sCount[nextLine] < 0 || terminatorRules.some((rule) => rule(state, nextLine, endLine, true))) {
      return null;
    }

    const pos = state.bMarks[nextLine] + state.tShift[nextLine];
    const max = state.eMarks[nextLine];
    return state.src.slice(pos, max + 1);
  };

  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let str = state.src.slice(pos, state.eMarks[startLine] + 1);
  let labelEnd = -1;

  for (pos = 1; pos < str.length; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 0x5B || ch === 0x5D) return false;

    if (ch === 0x0A && (nextLine = startLine + 1) && state.sCount[nextLine] < 0) return false;

    if (ch === 0x5D) {
      labelEnd = pos;
      break;
    }

    if (ch === 0x5C && pos + 1 < str.length) {
      if (str.charCodeAt(pos + 1) === 0x0A) {
        if (!getNextLine(nextLine += 1)) return false;
        str += state.src.slice(state.bMarks[nextLine] + state.tShift[nextLine], state.eMarks[nextLine] + 1);
      } else {
        pos++;
      }
    }
  }

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A) return false;

  for (pos = labelEnd + 2; pos < str.length; pos++) {
    if (!isSpace(str.charCodeAt(pos)) && str.charCodeAt(pos) !== 0x0A) break;
  }

  const destRes = state.md.helpers.parseLinkDestination(str, pos, str.length);
  if (!destRes.ok) return false;

  const href = state.md.normalizeLink(destRes.str);
  if (!state.md.validateLink(href)) return false;
  pos = destRes.pos;

  const start = pos;
  const destEndPos = pos;
  const destEndLineNo = nextLine;

  for (; pos < str.length; pos++) {
    if (!isSpace(str.charCodeAt(pos)) && str.charCodeAt(pos) !== 0x0A) break;
  }

  let titleRes = state.md.helpers.parseLinkTitle(str, pos, str.length);
  while (titleRes.can_continue) {
    if (!(str += getNextLine(++nextLine))) break;

    pos = str.length - 1;
    titleRes = state.md.helpers.parseLinkTitle(str, pos, str.length, titleRes);
  }

  const start = pos;
  const title = titleRes.ok ? titleRes.str : '';

  if (start !== pos && titleRes.ok) {
    const nextTitlePos = pos = titleRes.pos;
  } else {
    pos = destEndPos;
    nextLine = destEndLineNo;
    while (pos < str.length) {
      if (!isSpace(str.charCodeAt(pos))) break;
      pos++;
    }
  }

  if (pos < str.length && str.charCodeAt(pos) !== 0x0A) return false;

  const label = normalizeReference(str.slice(1, labelEnd));
  if (!label || label in state.env.references) return false;

  state.env.references[(state.env.references ?? {})[label] ??= {}] = { href, title };
  if (silent) return true;

  state.line = nextLine;
  return true;
}

const block_names = ["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"];

const attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
const unquoted = '[^"\'=<>`\\x00-\\x20]+';
const single_quoted = "'[^']*'";
const double_quoted = '"[^"]*"';
const attr_value = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';
const attribute = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';
const open_tag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';
const close_tag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
const comment = '<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->';
const processing = '<[?][\\s\\S]*?[?]>';
const declaration = '<![A-Za-z][^>]*>';
const cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';
const HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment + '|' + processing + '|' + declaration + '|' + cdata + ')');
const HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

const HTML_SEQUENCES = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true],
  [/^<!--/, /-->/, true],
  [/^<\?/, /\?>/, true],
  [/^<![A-Z]/, />/, true],
  [/^<!\[CDATA\[/, /\]\]>/, true],
  [new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true],
  [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'), /^$/, false]
];

function html_block(state, startLine, endLine, silent) {
  const MERGE_TAG = (nextLine) => {
    if (nextLine >= state.lineMax || state.isEmpty(nextLine)) return false;
    if (state.sCount[nextLine] < state.blkIndent) return false;

    const pos = state.bMarks[nextLine] + state.tShift[nextLine];
    const max = state.eMarks[nextLine];
    const lineText = state.src.slice(pos, max);
    if (HTML_SEQUENCES[i][1].test(lineText) && (lineText.length === 0 || ++nextLine)) return true;

    return state.isEmpty(++nextLine);
  }

  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (!state.md.options.html) return false;

  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  if (state.src.charCodeAt(pos) !== 0x3C) return false;

  const lineText = state.src.slice(pos, max);
  let i = HTML_SEQUENCES.findIndex(([openRe]) => openRe.test(lineText));
  if (i < 0) return false;

  if (silent) return HTML_SEQUENCES[i][2];
  let nextLine = startLine + 1;

  while (!HTML_SEQUENCES[i][1].test(lineText) && MERGE_TAG(nextLine));

  state.line = nextLine;
  const token = state.push('html_block', '', 0);
  token.map = [startLine, nextLine];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
  return true;
}

function heading(state, startLine, endLine, silent) {
  const MAX = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;

  const pos = state.bMarks[startLine] + state.tShift[startLine];
  if (state.src.charCodeAt(pos) !== 0x23 || pos >= MAX) return false;

  let level = 1;
  while (state.src.charCodeAt(++pos) === 0x23 && pos < MAX && level <= 6) level++;
  if (level > 6 || pos < MAX && !isSpace(state.src.charCodeAt(pos))) return false;

  if (silent) return true;

  const max = state.skipSpacesBack(MAX, pos);
  const tmp = state.skipCharsBack(max, 0x23, pos);
  const tail = tmp > pos && isSpace(state.src.charCodeAt(tmp - 1)) ? tmp : max;

  state.line = startLine + 1;
  const token_o = tokenFactory('heading_open', `h${level}`, 1, true);
  token_o.markup = '#'.repeat(level);
  token_o.map = [startLine, state.line];
  state.push(token_o);

  const contentToken = tokenFactory('inline', '', 0, true);
  contentToken.content = state.src.slice(pos, tail).trim();
  contentToken.map = [startLine, state.line];
  contentToken.children = [];
  state.push(contentToken);

  const token_c = tokenFactory('heading_close', `h${