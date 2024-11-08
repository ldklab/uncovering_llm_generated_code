'use strict';

const mdurl = require('mdurl');
const ucmicro = require('uc.micro');
const entities = require('entities');
const LinkifyIt = require('linkify-it');
const punycode = require('punycode.js');

// Utility Functions
function _class(obj) { return Object.prototype.toString.call(obj); }
function isString(obj) { return _class(obj) === '[object String]'; }
const _hasOwnProperty = Object.prototype.hasOwnProperty;
function has(object, key) { return _hasOwnProperty.call(object, key); }
function assign(obj, ...sources) {
  sources.forEach(source => {
    if (source && typeof source === 'object') {
      Object.keys(source).forEach(key => { obj[key] = source[key]; });
    }
  });
  return obj;
}
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
} 
function isValidEntityCode(c) {
  // Various checks for valid Unicode code points and exclusion of control codes
  return !(c >= 0xD800 && c <= 0xDFFF || c >= 0xFDD0 && c <= 0xFDEF
    || (c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE || c > 0x10FFFF
    || (c >= 0x00 && c <= 0x08) || c === 0x0B || (c >= 0x0E && c <= 0x1F)
    || (c >= 0x7F && c <= 0x9F));
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

// Main Class
class MarkdownIt {
  constructor(presetName, options) {
    if (!(this instanceof MarkdownIt)) return new MarkdownIt(presetName, options);
    if (!options) {
      if (!isString(presetName)) {
        options = presetName || {};
        presetName = 'default';
      }
    }
    this.inline = new ParserInline();
    this.block = new ParserBlock();
    this.core = new Core();
    this.renderer = new Renderer();
    this.linkify = new LinkifyIt();

    this.validateLink = validateLink;
    this.normalizeLink = normalizeLink;
    this.normalizeLinkText = normalizeLinkText;

    this.utils = utils;
    this.helpers = assign({}, helpers);

    this.options = {};
    this.configure(presetName);
    if (options) this.set(options);
  }

  set(options) {
    assign(this.options, options);
    return this;
  }

  configure(presets) {
    if (isString(presets)) {
      presets = config[presets];
      if (!presets) {
        throw new Error('Wrong `markdown-it` preset name');
      }
    }
    if (!presets) {
      throw new Error('Wrong `markdown-it` preset, can\'t be empty');
    }
    if (presets.options) this.set(presets.options);

    if (presets.components) {
      Object.keys(presets.components).forEach(name => {
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

  enable(list, ignoreInvalid) {
    let result = [];
    if (!Array.isArray(list)) {
      list = [list];
    }
    ['core', 'block', 'inline'].forEach(chain => {
      result = result.concat(this[chain].ruler.enable(list, true));
    }, this);
    result = result.concat(this.inline.ruler2.enable(list, true));
    const missed = list.filter(name => result.indexOf(name) < 0);
    if (missed.length && !ignoreInvalid) {
      throw new Error('Failed to enable unknown rule(s): ' + missed);
    }
    return this;
  }

  disable(list, ignoreInvalid) {
    let result = [];
    if (!Array.isArray(list)) {
      list = [list];
    }
    ['core', 'block', 'inline'].forEach(chain => {
      result = result.concat(this[chain].ruler.disable(list, true));
    }, this);
    result = result.concat(this.inline.ruler2.disable(list, true));
    const missed = list.filter(name => result.indexOf(name) < 0);
    if (missed.length && !ignoreInvalid) {
      throw new Error('Failed to disable unknown rule(s): ' + missed);
    }
    return this;
  }

  use(plugin, ...params) {
    const args = [this].concat(params);
    plugin.apply(plugin, args);
    return this;
  }

  parse(src, env) {
    if (typeof src !== 'string') throw new Error('Input data should be a String');
    const state = new this.core.State(src, this, env);
    this.core.process(state);
    return state.tokens;
  }

  render(src, env) {
    env = env || {};
    return this.renderer.render(this.parse(src, env), this.options, env);
  }

  parseInline(src, env) {
    const state = new this.core.State(src, this, env);
    state.inlineMode = true;
    this.core.process(state);
    return state.tokens;
  }

  renderInline(src, env) {
    env = env || {};
    return this.renderer.render(this.parseInline(src, env), this.options, env);
  }
}

// Core, ParserInline, ParserBlock classes, renderer methods, and other functionalities
// would follow similarly, as laid out in the original code.

module.exports = MarkdownIt;
