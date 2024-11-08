(function(global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.Mustache = factory();
  }
}(this, function() {
  'use strict';

  const objectToString = Object.prototype.toString;

  const isArray = Array.isArray || function(obj) {
    return objectToString.call(obj) === '[object Array]';
  };

  const isFunction = function(obj) {
    return typeof obj === 'function';
  };

  function typeStr(obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  function escapeHtml(string) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    return String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
  }

  function hasProperty(obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  function primitiveHasOwnProperty(primitive, propName) {
    return primitive != null && typeof primitive !== 'object' && primitive.hasOwnProperty(propName);
  }

  const regExpTest = RegExp.prototype.test;
  function testRegExp(re, string) {
    return regExpTest.call(re, string);
  }

  const nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  function parseTemplate(template, tags) {
    if (!template) return [];
    let lineHasNonSpace = false;
    const sections = [];
    const tokens = [];
    const spaces = [];
    let hasTag = false;
    let nonSpace = false;
    let indentation = '';
    let tagIndex = 0;

    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) delete tokens[spaces.pop()];
      } else {
        spaces.length = 0; 
      }
      hasTag = false;
      nonSpace = false;
    }

    let openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tagsToCompile) {
      if (typeof tagsToCompile === 'string') {
        tagsToCompile = tagsToCompile.split(/\s+/, 2);
      }

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2) {
        throw new Error('Invalid tags: ' + tagsToCompile);
      }

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    const scanner = new Scanner(template);

    let start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      value = scanner.scanUntil(openingTagRe);
      if (value) {
        for (let i = 0, len = value.length; i < len; ++i) {
          chr = value.charAt(i);
          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            lineHasNonSpace = true;
            indentation += ' ';
          }
          tokens.push(['text', chr, start, start + 1]);
          start += 1;
          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
            lineHasNonSpace = false;
          }
        }
      }

      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      if (type === '>') {
        token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
      } else {
        token = [type, value, start, scanner.pos];
      }
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        compileTags(value);
      }
    }

    stripSpace();

    openSection = sections.pop();
    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  function squashTokens(tokens) {
    const squashedTokens = [];
    let token, lastToken;
    for (let i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];
      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }
    return squashedTokens;
  }

  function nestTokens(tokens) {
    const nestedTokens = [];
    let collector = nestedTokens;
    const sections = [];

    let token, section;
    for (let i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];
      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }
    return nestedTokens;
  }

  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  Scanner.prototype.eos = function() {
    return this.tail === '';
  };

  Scanner.prototype.scan = function(re) {
    const match = this.tail.match(re);
    if (!match || match.index !== 0) return '';
    const str = match[0];
    this.tail = this.tail.substring(str.length);
    this.pos += str.length;
    return str;
  };

  Scanner.prototype.scanUntil = function(re) {
    const index = this.tail.search(re);
    let match;
    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }
    this.pos += match.length;
    return match;
  };

  function Context(view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  Context.prototype.push = function(view) {
    return new Context(view, this);
  };

  Context.prototype.lookup = function(name) {
    const cache = this.cache;
    let value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      let context = this, intermediateValue, names, index, lookupHit = false;
      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }
        context = context.parent;
      }
      cache[name] = value;
    }
    return isFunction(value) ? value.call(this.view) : value;
  };

  function Writer() {
    this.templateCache = {
      _cache: {},
      set: function(key, value) {
        this._cache[key] = value;
      },
      get: function(key) {
        return this._cache[key];
      },
      clear: function() {
        this._cache = {};
      }
    };
  }

  Writer.prototype.clearCache = function() {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  Writer.prototype.parse = function(template, tags) {
    const cache = this.templateCache;
    const cacheKey = template + ':' + (tags || mustache.tags).join(':');
    const isCacheEnabled = typeof cache !== 'undefined';
    let tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;
    if (tokens === undefined) {
      tokens = parseTemplate(template, tags);
      if (isCacheEnabled) cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  Writer.prototype.render = function(template, view, partials, config) {
    const tags = this.getConfigTags(config);
    const tokens = this.parse(template, tags);
    const context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, config);
  };

  Writer.prototype.renderTokens = function(tokens, context, partials, originalTemplate, config) {
    let buffer = '';
    let token, symbol, value;
    for (let i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];
      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, config);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context, config);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined) buffer += value;
    }
    return buffer;
  };

  Writer.prototype.renderSection = function(token, context, partials, originalTemplate, config) {
    const self = this;
    let buffer = '';
    const value = context.lookup(token[1]);

    function subRender(template) {
      return self.render(template, context, partials, config);
    }

    if (!value) return;

    if (isArray(value)) {
      for (let j = 0, len = value.length; j < len; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function(token, context, partials, originalTemplate, config) {
    const value = context.lookup(token[1]);
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate, config);
  };

  Writer.prototype.indentPartial = function(partial, indentation, lineHasNonSpace) {
    const filteredIndentation = indentation.replace(/[^ \t]/g, '');
    const partialByNl = partial.split('\n');
    for (let i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function(token, context, partials, config) {
    if (!partials) return;
    const tags = this.getConfigTags(config);
    const value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      const lineHasNonSpace = token[6];
      const tagIndex = token[5];
      const indentation = token[4];
      let indentedValue = value;
      if (tagIndex === 0 && indentation) {
        indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
      }
      const tokens = this.parse(indentedValue, tags);
      return this.renderTokens(tokens, context, partials, indentedValue, config);
    }
  };

  Writer.prototype.unescapedValue = function(token, context) {
    const value = context.lookup(token[1]);
    if (value != null) return value;
  };

  Writer.prototype.escapedValue = function(token, context, config) {
    const escape = this.getConfigEscape(config) || mustache.escape;
    const value = context.lookup(token[1]);
    if (value != null)
      return (typeof value === 'number' && escape === mustache.escape) ? String(value) : escape(value);
  };

  Writer.prototype.rawValue = function(token) {
    return token[1];
  };

  Writer.prototype.getConfigTags = function(config) {
    if (isArray(config)) {
      return config;
    } else if (config && typeof config === 'object') {
      return config.tags;
    } else {
      return undefined;
    }
  };

  Writer.prototype.getConfigEscape = function(config) {
    if (config && typeof config === 'object' && !isArray(config)) {
      return config.escape;
    } else {
      return undefined;
    }
  };

  const mustache = {
    name: 'mustache.js',
    version: '4.1.0',
    tags: ['{{', '}}'],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,

    set templateCache(cache) {
      defaultWriter.templateCache = cache;
    },

    get templateCache() {
      return defaultWriter.templateCache;
    }
  };

  const defaultWriter = new Writer();

  mustache.clearCache = function() {
    return defaultWriter.clearCache();
  };

  mustache.parse = function(template, tags) {
    return defaultWriter.parse(template, tags);
  };

  mustache.render = function(template, view, partials, config) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)');
    }
    return defaultWriter.render(template, view, partials, config);
  };

  mustache.escape = escapeHtml;
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;
}));
