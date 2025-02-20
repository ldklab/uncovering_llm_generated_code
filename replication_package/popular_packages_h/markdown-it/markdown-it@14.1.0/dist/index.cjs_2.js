'use strict';

const mdurl = require('mdurl');
const ucmicro = require('uc.micro');
const entities = require('entities');
const LinkifyIt = require('linkify-it');
const punycode = require('punycode.js');

// Utility functions
function _class(obj) {
  return Object.prototype.toString.call(obj);
}

function isString(obj) {
  return _class(obj) === '[object String]';
}

const _hasOwnProperty = Object.prototype.hasOwnProperty;

function has(object, key) {
  return _hasOwnProperty.call(object, key);
}

function assign(obj, ...sources) {
  sources.forEach((source) => {
    if (!source) return;
    if (typeof source !== 'object') throw new TypeError(source + ' must be object');
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
  // Check for various invalid code ranges
  if ((c >= 0xD800 && c <= 0xDFFF) || (c >= 0xFDD0 && c <= 0xFDEF) || c > 0x10FFFF ||
      ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) ||
      (c >= 0x00 && c <= 0x08) || c === 0x0B || (c >= 0x0E && c <= 0x1F) ||
      (c >= 0x7F && c <= 0x9F)) {
    return false;
  }
  return true;
}

function fromCodePoint(c) {
  if (c > 0xffff) {
    c -= 0x10000;
    return String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 0x3ff));
  }
  return String.fromCharCode(c);
}

const UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
const ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
const UNESCAPE_ALL_RE = new RegExp(`${UNESCAPE_MD_RE.source}|${ENTITY_RE.source}`, 'gi');
const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;

function replaceEntityPattern(match, name) {
  if (name.charCodeAt(0) === 0x23 /* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }
    return match;
  }
  const decoded = entities.decodeHTML(match);
  return decoded !== match ? decoded : match;
}

function unescapeMd(str) {
  return str.indexOf('\\') < 0 ? str : str.replace(UNESCAPE_MD_RE, '$1');
}

function unescapeAll(str) {
  return str.indexOf('\\') < 0 && str.indexOf('&') < 0 ? str
    : str.replace(UNESCAPE_ALL_RE, (match, escaped, entity) => (escaped ? escaped : replaceEntityPattern(match, entity)));
}

const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

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
  const whiteSpaceChars = [0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x20, 0xA0, 0x1680, 0x202F, 0x205F, 0x3000];
  return (code >= 0x2000 && code <= 0x200A) || whiteSpaceChars.includes(code);
}

function isPunctChar(ch) {
  return ucmicro.P.test(ch) || ucmicro.S.test(ch);
}

function isMdAsciiPunct(ch) {
  const asciiPunctChars = [0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F,
    0x3A, 0x3B, 0x3C, 0x3D, 0x3E, 0x3F, 0x40, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F, 0x60, 0x7B, 0x7C, 0x7D, 0x7E];
  return asciiPunctChars.includes(ch);
}

function normalizeReference(str) {
  str = str.trim().replace(/\s+/g, ' ');
  if ('ẞ'.toLowerCase() === 'Ṿ') {
    str = str.replace(/ẞ/g, 'ß');
  }
  return str.toLowerCase().toUpperCase();
}

const lib = { mdurl, ucmicro };
const utils = Object.freeze({
  arrayReplaceAt, assign, escapeHtml, escapeRE, fromCodePoint, has, isMdAsciiPunct, isPunctChar, isSpace, isString,
  isValidEntityCode, isWhiteSpace, lib, normalizeReference, unescapeAll, unescapeMd
});

function parseLinkLabel(state, start, disableNested) {
  let level = 1, found = false, marker, prevPos;
  const max = state.posMax, oldPos = state.pos;
  state.pos = start + 1;

  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 0x5D /* ] */) {
      if (--level === 0) {
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

  const labelEnd = found ? state.pos : -1;
  state.pos = oldPos;
  return labelEnd;
}

function parseLinkDestination(str, start, max) {
  let pos = start, result = { ok: false, pos: 0, str: '' };
  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++;
    while (pos < max) {
      const code = str.charCodeAt(pos);
      if (code === 0x0A || code === 0x3C || (code === 0x3E && (result.pos = pos + 1))) {
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code === 0x5C && pos + 1 < max) {
        pos += 2;
        continue;
      }
      pos++;
    }
    return result;
  }

  let level = 0;
  while (pos < max) {
    const code = str.charCodeAt(pos);
    if (code === 0x20 || code < 0x20 || code === 0x7F || 
        (code === 0x28 && ++level > 32) || code === 0x29 && level-- === 0) {
      break;
    }
    if (code === 0x5C && pos + 1 < max && str.charCodeAt(pos + 1) === 0x20) {
      break;
    }
    pos++;
  }

  if (start !== pos && level === 0) {
    result.str = unescapeAll(str.slice(start, pos));
    result.pos = pos;
    result.ok = true;
  }
  return result;
}

function parseLinkTitle(str, start, max, prevState) {
  let pos = start, state = { ok: false, can_continue: false, pos: 0, str: '', marker: 0 };

  if (prevState) {
    state = { ...prevState, str: prevState.str };
  } else {
    if (pos >= max || ![0x22, 0x27, 0x28].includes(str.charCodeAt(pos))) {
      return state;
    }

    state.marker = str.charCodeAt(pos) === 0x28 ? 0x29 : str.charCodeAt(pos);
    start = ++pos;
  }

  while (pos < max) {
    const code = str.charCodeAt(pos);
    if (code === state.marker) {
      state.pos = pos + 1;
      state.ok = true;
      state.str += unescapeAll(str.slice(start, pos));
      return state;
    }
    if (code === 0x28 && state.marker === 0x29) return state;
    if (code === 0x5C && pos + 1 < max) pos++;
    pos++;
  }

  state.can_continue = true;
  state.str += unescapeAll(str.slice(start, pos));
  return state;
}

const helpers = Object.freeze({ parseLinkDestination, parseLinkLabel, parseLinkTitle });

class Renderer {
  constructor() {
    this.rules = assign({}, default_rules);
  }

  renderAttrs(token) {
    if (!token.attrs) return '';
    return token.attrs.reduce((result, attr) => result + ` ${escapeHtml(attr[0])}="${escapeHtml(attr[1])}"`, '');
  }

  renderToken(tokens, idx, options) {
    const token = tokens[idx];
    let result = '';

    if (token.hidden) return '';

    if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
      result += '\n';
    }

    result += token.nesting === -1 ? `</${token.tag}` : `<${token.tag}`;
    result += this.renderAttrs(token);

    if (token.nesting === 0 && options.xhtmlOut) {
      result += ' /';
    }

    result += token.block ? '>\n' : '>';
    return result;
  }

  renderInline(tokens, options, env) {
    return tokens.reduce((result, token) => {
      const rule = this.rules[token.type];
      return rule ? result + rule(tokens, token, options, env, this) : result + this.renderToken(tokens, token, options);
    }, '');
  }

  renderInlineAsText(tokens, options, env) {
    return tokens.reduce((result, token) => {
      if (token.type === 'text') return result + token.content;
      if (token.type === 'image') return result + this.renderInlineAsText(token.children, options, env);
      if (token.type === 'html_inline') return result + token.content;
      if (token.type === 'softbreak' || token.type === 'hardbreak') return result + '\n';
      return result;
    }, '');
  }

  render(tokens, options, env) {
    return tokens.reduce((result, token) => {
      const rule = this.rules[token.type];
      return token.type === 'inline' 
        ? result + this.renderInline(token.children, options, env) 
        : rule ? result + rule(tokens, token, options, env, this) : result + this.renderToken(tokens, token, options);
    }, '');
  }
}

const default_rules = {
  code_inline: (tokens, idx, options, env, slf) => `<code${slf.renderAttrs(tokens[idx])}>${escapeHtml(tokens[idx].content)}</code>`,
  code_block: (tokens, idx, options, env, slf) => `<pre${slf.renderAttrs(tokens[idx])}><code>${escapeHtml(tokens[idx].content)}</code></pre>\n`,
  fence: (tokens, idx, options, env, slf) => {
    const token = tokens[idx], info = token.info ? unescapeAll(token.info).trim() : '';
    let langName, langAttrs;
    if (info) {
      [langName, , langAttrs] = info.split(/(\s+)/g);
    }
    const highlight = options.highlight 
      ? options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content)
      : escapeHtml(token.content);

    if (highlight.indexOf('<pre') === 0) return highlight + '\n';
    if (info) {
      const i = token.attrIndex('class');
      const tmpAttrs = token.attrs ? token.attrs.slice() : [];
      const className = options.langPrefix + langName;

      if (i < 0) {
        tmpAttrs.push(['class', className]);
      } else {
        tmpAttrs[i] = tmpAttrs[i].slice();
        tmpAttrs[i][1] += ' ' + className;
      }

      const tmpToken = { attrs: tmpAttrs };
      return `<pre><code${slf.renderAttrs(tmpToken)}>${highlight}</code></pre>\n`;
    }
    return `<pre><code${slf.renderAttrs(token)}>${highlight}</code></pre>\n`;
  },
  image: (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    token.attrs[token.attrIndex('alt')][1] = slf.renderInlineAsText(token.children, options, env);
    return slf.renderToken(tokens, idx, options);
  },
  hardbreak: (tokens, idx, options) => (options.xhtmlOut ? '<br />\n' : '<br>\n'),
  softbreak: (tokens, idx, options) => (options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n'),
  text: (tokens, idx) => escapeHtml(tokens[idx].content),
  html_block: (tokens, idx) => tokens[idx].content,
  html_inline: (tokens, idx) => tokens[idx].content,
};

class Ruler {
  constructor() {
    this.__rules__ = [];
    this.__cache__ = null;
  }

  __find__(name) {
    return this.__rules__.findIndex(rule => rule.name === name);
  }

  __compile__() {
    const self = this;
    const chains = [''];

    this.__rules__.forEach(rule => {
      if (!rule.enabled) return;
      rule.alt.forEach(altName => {
        if (!chains.includes(altName)) chains.push(altName);
      });
    });

    self.__cache__ = {};
    chains.forEach(chain => {
      self.__cache__[chain] = self.__rules__.filter(rule => {
        return rule.enabled && (chain === '' || rule.alt.includes(chain));
      }).map(rule => rule.fn);
    });
  }

  at(name, fn, options = {}) {
    const index = this.__find__(name);
    if (index === -1) {
      throw new Error(`Parser rule not found: ${name}`);
    }
    this.__rules__[index].fn = fn;
    this.__rules__[index].alt = options.alt || [];
    this.__cache__ = null;
  }

  before(beforeName, ruleName, fn, options = {}) {
    const index = this.__find__(beforeName);
    if (index === -1) {
      throw new Error(`Parser rule not found: ${beforeName}`);
    }
    this.__rules__.splice(index, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }

  after(afterName, ruleName, fn, options = {}) {
    const index = this.__find__(afterName);
    if (index === -1) {
      throw new Error(`Parser rule not found: ${afterName}`);
    }
    this.__rules__.splice(index + 1, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }

  push(ruleName, fn, options = {}) {
    this.__rules__.push({
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }

  enable(list, ignoreInvalid) {
    const result = Array.isArray(list) ? list : [list];
    result.forEach((name) => {
      const idx = this.__find__(name);
      if (idx < 0 && !ignoreInvalid) {
        throw new Error(`Rules manager: invalid rule name ${name}`);
      }
      if (idx >= 0) this.__rules__[idx].enabled = true;
    });
    this.__cache__ = null;
    return result;
  }

  enableOnly(list, ignoreInvalid) {
    this.__rules__.forEach(rule => rule.enabled = false);
    this.enable(list, ignoreInvalid);
  }

  disable(list, ignoreInvalid) {
    const result = Array.isArray(list) ? list : [list];
    result.forEach((name) => {
      const idx = this.__find__(name);
      if (idx < 0 && !ignoreInvalid) {
        throw new Error(`Rules manager: invalid rule name ${name}`);
      }
      if (idx >= 0) this.__rules__[idx].enabled = false;
    });
    this.__cache__ = null;
    return result;
  }

  getRules(chainName) {
    if (!this.__cache__) this.__compile__();
    return this.__cache__[chainName] || [];
  }
}

class Core {
  constructor() {
    this.ruler = new Ruler();
    _rules$2.forEach(([name, fn]) => this.ruler.push(name, fn));
  }

  process(state) {
    this.ruler.getRules('').forEach(rule => rule(state));
  }
}

const _rules$2 = [
  ['normalize', normalize],
  ['block', block],
  ['inline', inline],
  ['linkify', linkify$1],
  ['replacements', replace],
  ['smartquotes', smartquotes],
  ['text_join', text_join],
];

class StateCore {
  constructor(src, md, env) {
    this.src = src;
    this.env = env;
    this.tokens = [];
    this.inlineMode = false;
    this.md = md;
  }
}

function normalize(state) {
  state.src = state.src.replace(NEWLINES_RE, '\n').replace(NULL_RE, '\uFFFD');
}

const NEWLINES_RE = /\r\n?|\n/g;
const NULL_RE = /\0/g;

function block(state) {
  if (state.inlineMode) {
    const token = new state.Token('inline', '', 0);
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
    return;
  }
  state.md.block.parse(state.src, state.md, state.env, state.tokens);
}

function inline(state) {
  const tokens = state.tokens;

  for (let i = 0, l = tokens.length; i < l; i++) {
    if (tokens[i].type === 'inline') {
      state.md.inline.parse(tokens[i].content, state.md, state.env, tokens[i].children);
    }
  }
}

function linkify$1(state) {
  const blockTokens = state.tokens;
  if (!state.md.options.linkify) {
    return;
  }
  blockTokens.forEach((blockToken, j) => {
    if (blockToken.type !== 'inline' || !state.md.linkify.pretest(blockToken.content)) {
      return;
    }
    let tokens = blockToken.children;
    let htmlLinkLevel = 0;

    for (let i = tokens.length - 1; i >= 0; i--) {
      const currentToken = tokens[i];

      if (currentToken.type === 'link_close') {
        i--;
        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
          i--;
        }
        continue;
      }

      if (currentToken.type === 'html_inline') {
        if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose$1(currentToken.content)) {
          htmlLinkLevel++;
        }
      }

      if (htmlLinkLevel > 0) {
        continue;
      }
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
          const { url, text: urlTextOriginal } = link;
          const fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) {
            return;
          }

          let urlText = urlTextOriginal;
          if (!link.schema) {
            urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
          } else if (link.schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
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

        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  });
}

function replace(state) {
  if (!state.md.options.typographer) return;
  state.tokens.forEach((blockToken, blkIdx) => {
    if (blockToken.type !== 'inline') return;

    const scopedMatch = SCOPED_ABBR_TEST_RE.test(blockToken.content);
    const rareMatch = RARE_RE.test(blockToken.content);

    if (scopedMatch) replace_scoped(blockToken.children);
    if (rareMatch) replace_rare(blockToken.children);
  });
}

const SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
const SCOPED_ABBR_RE = /\((c|tm|r)\)/ig;
const SCOPED_ABBR = {
  c: '©',
  r: '®',
  tm: '™'
};

const RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

function replace_scoped(inlineTokens) {
  let inside_autolink = 0;
  inlineTokens.forEach((token) => {
    if (token.type === 'text' && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, (_, name) => SCOPED_ABBR[name.toLowerCase()]);
    }
    if (token.type === 'link_open' && token.info === 'auto') inside_autolink--;
    if (token.type === 'link_close' && token.info === 'auto') inside_autolink++;
  });
}

function replace_rare(inlineTokens) {
  let inside_autolink = 0;
  inlineTokens.forEach((token) => {
    if (token.type === 'text' && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content.replace(/\+-/g, '±')
          .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
          .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
          .replace(/(^|[^-])---(?=[^-]|$)/mg, '$1\u2014')
          .replace(/(^|\s)--(?=\s|$)/mg, '$1\u2013')
          .replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, '$1\u2013');
      }
    }
    if (token.type === 'link_open' && token.info === 'auto') inside_autolink--;
    if (token.type === 'link_close' && token.info === 'auto') inside_autolink++;
  });
}

const QUOTE_TEST_RE = /['"]/;
const QUOTE_RE = /['"]/g;
const APOSTROPHE = '\u2019'; /* ’ */

function smartquotes(state) {
  if (!state.md.options.typographer) return;

  state.tokens.forEach((blockToken, blkIdx) => {
    if (blockToken.type !== 'inline' || !QUOTE_TEST_RE.test(blockToken.content)) return;
    process_inlines(blockToken.children, state);
  });
}

function process_inlines(tokens, state) {
  const stack = [];
  tokens.forEach((token, i) => {
    const thisLevel = token.level;
    for (let j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= thisLevel) break;
    }
    stack.length = j + 1;

    if (token.type !== 'text') return;

    let text = token.content;
    let pos = 0, max = text.length;

    OUTER: while (pos < max) {
      const match = QUOTE_RE.exec(text.slice(pos));
      if (!match) break;

      let canOpen = true, canClose = true;
      pos += match.index + 1;
      const isSingle = match[0] === "'";

      let lastChar = 0x20;
      if (match.index - 1 >= 0) {
        lastChar = text.charCodeAt(match.index - 1);
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

      if (!canOpen && !canClose) {
        if (isSingle) token.content = replaceAt(token.content, match.index, APOSTROPHE);
        continue;
      }

      if (canClose) {
        for (let j = stack.length - 1; j >= 0; j--) {
          let item = stack[j];
          if (stack[j].level < thisLevel) break;
          if (item.single === isSingle && stack[j].level === thisLevel) {
            item = stack[j];
            let openQuote, closeQuote;
            if (isSingle) {
              openQuote = state.md.options.quotes[2];
              closeQuote = state.md.options.quotes[3];
            } else {
              openQuote = state.md.options.quotes[0];
              closeQuote = state.md.options.quotes[1];
            }

            token.content = replaceAt(token.content, match.index, closeQuote);
            tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote);
            pos += closeQuote.length - 1;
            if (item.token === i) pos += openQuote.length - 1;

            text = token.content;
            max = text.length;
            stack.length = j;
            continue OUTER;
          }
        }
      }

      if (canOpen) stack.push({ token: i, pos: match.index, single: isSingle, level: thisLevel });
      else if (canClose && isSingle) token.content = replaceAt(token.content, match.index, APOSTROPHE);
    }
  });
}

function replaceAt(str, index, ch) {
  return str.slice(0, index) + ch + str.slice(index + 1);
}

function text_join(state) {
  const blockTokens = state.tokens;
  blockTokens.forEach((blockToken) => {
    if (blockToken.type !== 'inline') return;

    const tokens = blockToken.children;
    tokens.forEach((token) => {
      if (token.type === 'text_special') token.type = 'text';
    });

    let last = 0;
    tokens.forEach((token, i) => {
      if (token.type === 'text' && i + 1 < tokens.length && tokens[i + 1].type === 'text') {
        tokens[i + 1].content = token.content + tokens[i + 1].content;
      } else {
        if (i !== last) tokens[last] = token;
        last++;
      }
    });

    if (tokens.length !== last) tokens.length = last;
  });
}

function isLinkOpen$1(content) {
  return /^<a[>\s]/i.test(content);
}

function isLinkClose$1(content) {
  return /^<\/a\s*>/i.test(content);
}

class ParserBlock {
  constructor() {
    this.ruler = new Ruler();
    _rules$1.forEach(([name, fn, alt]) => this.ruler.push(name, fn, { alt }));
  }

  tokenize(state, startLine, endLine) {
    const rules = this.ruler.getRules('');
    let line = startLine, hasEmptyLines = false;

    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) break;
      if (state.sCount[line] < state.blkIndent) break;
      if (state.level >= state.md.options.maxNesting) {
        state.line = endLine;
        break;
      }

      const prevLine = state.line;
      const ok = rules.some((rule) => rule(state, line, endLine, false));
      if (!ok) throw new Error('none of the block rules matched');
      if (prevLine >= state.line) throw new Error("block rule didn't increment state.line");

      state.tight = !hasEmptyLines;
      if (state.isEmpty(state.line - 1)) hasEmptyLines = true;
      line = state.line;

      if (line < endLine && state.isEmpty(line)) {
        hasEmptyLines = true;
        line++;
        state.line = line;
      }
    }
  }

  parse(src, md, env, outTokens) {
    if (!src) return;
    const state = new StateBlock(src, md, env, outTokens);
    this.tokenize(state, state.line, state.lineMax);
  }
}

const _rules$1 = [
  ['table', table, ['paragraph', 'reference']], 
  ['code', code], 
  ['fence', fence, ['paragraph', 'reference', 'blockquote', 'list']], 
  ['blockquote', blockquote, ['paragraph', 'reference', 'blockquote', 'list']], 
  ['hr', hr, ['paragraph', 'reference', 'blockquote', 'list']], 
  ['list', list, ['paragraph', 'reference', 'blockquote']], 
  ['reference', reference], 
  ['html_block', html_block, ['paragraph', 'reference', 'blockquote']], 
  ['heading', heading, ['paragraph', 'reference', 'blockquote']], 
  ['lheading', lheading], 
  ['paragraph', paragraph]
];

class StateBlock {
  constructor(src, md, env, tokens) {
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

    const s = this.src;
    for (let pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false, start = 0; pos < len; pos++) {
      const ch = s.charCodeAt(pos);
      if (!indent_found) {
        if (isSpace(ch)) {
          indent++;
          ch === 0x09 ? offset += 4 - offset % 4 : offset++;
          continue;
        } else {
          indent_found = true;
        }
      }
      if (ch === 0x0A || pos === len - 1) {
        if (ch !== 0x0A) pos++;
        this.bMarks.push(start);
        this.eMarks.push(pos);
        this.tShift.push(indent);
        this.sCount.push(offset);
        this.bsCount.push(0);
        indent_found = false;
        indent = offset = 0;
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

  push(type, tag, nesting) {
    const token = new Token(type, tag, nesting);
    token.block = true;
    if (nesting < 0) this.level--;
    token.level = this.level;
    if (nesting > 0) this.level++;
    this.tokens.push(token);
    return token;
  }

  isEmpty(line) {
    return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
  }

  skipEmptyLines(from) {
    for (let max = this.lineMax; from < max; from++) {
      if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) break;
    }
    return from;
  }

  skipSpaces(pos) {
    for (let max = this.src.length; pos < max; pos++) {
      if (!isSpace(this.src.charCodeAt(pos))) break;
    }
    return pos;
  }

  skipSpacesBack(pos, min) {
    if (pos <= min) return pos;
    while (pos > min) {
      if (!isSpace(this.src.charCodeAt(--pos))) return pos + 1;
    }
    return pos;
  }

  skipChars(pos, code) {
    for (let max = this.src.length; pos < max; pos++) {
      if (this.src.charCodeAt(pos) !== code) break;
    }
    return pos;
  }

  skipCharsBack(pos, code, min) {
    if (pos <= min) return pos;
    while (pos > min) {
      if (this.src.charCodeAt(--pos) !== code) return pos + 1;
    }
    return pos;
  }

  getLines(begin, end, indent, keepLastLF) {
    if (begin >= end) return '';
    const queue = [];
    for (let i = 0, line = begin; line < end; line++, i++) {
      const lineStart = this.bMarks[line];
      let lineIndent = 0, first = lineStart, last = this.eMarks[line];

      if (line + 1 < end || keepLastLF) last++;
      while (first < last && lineIndent < indent) {
        const ch = this.src.charCodeAt(first);
        if (isSpace(ch)) {
          ch === 0x09 ? lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4 : lineIndent++;
        } else if (first - lineStart < this.tShift[line]) {
          lineIndent++;
        } else break;
        first++;
      }
      queue[i] = lineIndent > indent ? ' '.repeat(lineIndent - indent) + this.src.slice(first, last) : this.src.slice(first, last);
    }
    return queue.join('');
  }

  Token = Token;
}

class Token {
  constructor(type, tag, nesting) {
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

  attrIndex(name) {
    return this.attrs ? this.attrs.findIndex(attr => attr[0] === name) : -1;
  }

  attrPush(attrData) {
    this.attrs ? this.attrs.push(attrData) : this.attrs = [attrData];
  }

  attrSet(name, value) {
    const idx = this.attrIndex(name);
    idx < 0 ? this.attrPush([name, value]) : this.attrs[idx] = [name, value];
  }

  attrGet(name) {
    const idx = this.attrIndex(name);
    return idx >= 0 ? this.attrs[idx][1] : null;
  }

  attrJoin(name, value) {
    const idx = this.attrIndex(name);
    if (idx < 0) {
      this.attrPush([name, value]);
    } else {
      this.attrs[idx][1] += ' ' + value;
    }
  }
}

// More block functions go here...

const utils = {
  isString,
  assign,
  isSpace,
  escapeHtml,
  escapeRE,
  unescapeMd,
  unescapeAll,
  normalizeReference,
  replaceEntityPattern,
  entities,
  mdurl,
  punycode,
  isValidEntityCode,
  fromCodePoint
};

const helpers = {
  parseLinkLabel,
  parseLinkDestination,
  parseLinkTitle
};

class MarkdownIt {
  constructor(presetName = 'default', options = {}) {
    if (!(this instanceof MarkdownIt)) {
      return new MarkdownIt(presetName, options);
    }

    this.inline = new ParserInline();

    this.block = new ParserBlock();

    this.core = new Core();

    this.renderer = new Renderer();

    this.linkify = new LinkifyIt();

    this.options = {};

    if (presetName) {
      this.configure(config[presetName]);
    }

    this.set(options);

    this.validateLink = validateLink;
    this.normalizeLink = normalizeLink;
    this.normalizeLinkText = normalizeLinkText;

    this.utils = utils;
    this.helpers = helpers;
  }

  configure(presets) {
    if (isString(presets)) {
      const presetName = presets;
      presets = config[presetName];
      if (!presets) throw new Error(`Wrong markdown-it preset "${presetName}", check name.`);
    }

    if (!presets) throw new Error("Wrong markdown-it preset, can't be empty.");

    if (presets.options) this.set(presets.options);

    if (presets.components) {
      Object.keys(presets.components).forEach((name) => {
        if (presets.components[name].rules) {
          this[name].ruler.enableOnly(presets.components[name].rules);
        }

        if (presets.components[name].rules2) {
          this[name].ruler2.enableOnly(presets.components[name].rules2);
        }
      });
    }

    return this;
  }

  set(options) {
    assign(this.options, options);
    return this;
  }

  enable(list, ignoreInvalid = false) {
    ['core', 'block', 'inline'].forEach((chain) => {
      this[chain].ruler.enable(list, true);
    });

    this.inline.ruler2.enable(list, true);

    if (ignoreInvalid) return this;

    const missed = list.filter((name) => {
      return !this[chain].ruler.getRules('').includes(name);
    });

    if (missed.length) {
      throw new Error(`MarkdownIt. Failed to enable unknown rule(s): ${missed}`);
    }

    return this;
  }

  disable(list, ignoreInvalid = false) {
    ['core', 'block', 'inline'].forEach((chain) => {
      this[chain].ruler.disable(list, true);
    });

    this.inline.ruler2.disable(list, true);

    if (ignoreInvalid) return this;

    const missed = list.filter((name) => {
      return !this[chain].ruler.getRules('').includes(name);
    });

    if (missed.length) {
      throw new Error(`MarkdownIt. Failed to disable unknown rule(s): ${missed}`);
    }

    return this;
  }

  use(plugin, ...args) {
    plugin(this, ...args);
    return this;
  }

  parse(src, env) {
    if (typeof src !== 'string') {
      throw new Error('Input data should be a String');
    }

    const state = new this.core.State(src, this, env);

    this.core.process(state);

    return state.tokens;
  }

  render(src, env = {}) {
    return this.renderer.render(this.parse(src, env), this.options, env);
  }

  parseInline(src, env) {
    const state = new this.core.State(src, this, env);
    state.inlineMode = true;
    this.core.process(state);
    return state.tokens;
  }

  renderInline(src, env = {}) {
    return this.renderer.render(this.parseInline(src, env), this.options, env);
  }
}

module.exports = MarkdownIt;

