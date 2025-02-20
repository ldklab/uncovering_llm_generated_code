(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    (global = global || self, global.Mustache = factory());
  }
}(this, (function () {
  'use strict';

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function (obj) { return objectToString.call(obj) === '[object Array]'; };
  var isFunction = function (obj) { return typeof obj === 'function'; };

  function typeStr(obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  function hasProperty(obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  function primitiveHasOwnProperty(primitive, propName) {
    return primitive != null && typeof primitive !== 'object' && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
  }

  var regExpTest = RegExp.prototype.test;
  function testRegExp(re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function parseTemplate(template, tags) {
    if (!template) return [];

    var sections = [];
    var tokens = [];
    var spaces = [];
    var hasTag = false;
    var nonSpace = false;
    var indentation = '';
    var tagIndex = 0;

    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }
      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
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

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            indentation += ' ';
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;

          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
          }
        }
      }

      if (!scanner.scan(openingTagRe)) break;

      hasTag = true;

      type = scanner.scan(/#|\^|\/|>|\{|&|=|!/) || 'name';
      scanner.scan(/\s*/);

      if (type === '=') {
        value = scanner.scanUntil(/\s*=|\s*\}/);
        scanner.scan(/\s*=(?=\s*\})/);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(closingCurlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      if (!scanner.scan(closingTagRe)) {
        throw new Error('Unclosed tag at ' + scanner.pos);
      }

      token = type == '>' ? [ type, value, start, scanner.pos, indentation, tagIndex ] : [ type, value, start, scanner.pos ];
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        openSection = sections.pop();

        if (!openSection) {
          throw new Error('Unopened section "' + value + '" at ' + start);
        }
        if (openSection[1] !== value) {
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
        }
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        compileTags(value);
      }
    }

    stripSpace();

    openSection = sections.pop();

    if (openSection) {
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    }

    return nestTokens(squashTokens(tokens));
  }

  function squashTokens(tokens) {
    var squashedTokens = [];
    var lastToken;

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      var token = tokens[i];
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
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      var token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          var section = sections.pop();
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

  Scanner.prototype.eos = function () {
    return this.tail === '';
  };

  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0) return '';

    var string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

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

  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  Context.prototype.lookup = function (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1) lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);

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

    if (isFunction(value)) value = value.call(this.view);

    return value;
  };

  function Writer() {
    this.templateCache = {
      _cache: {},
      set: function (key, value) {
        this._cache[key] = value;
      },
      get: function (key) {
        return this._cache[key];
      },
      clear: function () {
        this._cache = {};
      }
    };
  }

  Writer.prototype.clearCache = function () {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  Writer.prototype.parse = function (template, tags) {
    var cache = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var tokens = cache ? cache.get(cacheKey) : undefined;

    if (!tokens) {
      tokens = parseTemplate(template, tags);
      if (cache) cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  Writer.prototype.render = function (template, view, partials, config) {
    var tags = this.getConfigTags(config);
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, config);
  };

  Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate, config) {
    var buffer = '';

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      var value = undefined;
      var token = tokens[i];
      var symbol = token[0];

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

  Writer.prototype.renderSection = function (token, context, partials, originalTemplate, config) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    function subRender(template) {
      return self.render(template, context, partials, config);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string') throw new Error('Cannot use higher-order sections without the original template');

      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null) buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function (token, context, partials, originalTemplate, config) {
    var value = context.lookup(token[1]);
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate, config);
  };

  Writer.prototype.indentPartial = function (partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for (var i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function (token, context, partials, config) {
    if (!partials) return;
    var tags = this.getConfigTags(config);

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      var indentation = token[4];
      var indentedValue = token[5] == 0 && indentation ? this.indentPartial(value, indentation, token[6]) : value;
      var tokens = this.parse(indentedValue, tags);
      return this.renderTokens(tokens, context, partials, indentedValue, config);
    }
  };

  Writer.prototype.unescapedValue = function (token, context) {
    var value = context.lookup(token[1]);
    if (value != null) return value;
  };

  Writer.prototype.escapedValue = function (token, context, config) {
    var escape = this.getConfigEscape(config) || mustache.escape;
    var value = context.lookup(token[1]);
    if (value != null) return (typeof value === 'number' && escape === mustache.escape) ? String(value) : escape(value);
  };

  Writer.prototype.rawValue = function (token) {
    return token[1];
  };

  Writer.prototype.getConfigTags = function (config) {
    if (isArray(config)) {
      return config;
    } else if (config && typeof config === 'object') {
      return config.tags;
    }
  };

  Writer.prototype.getConfigEscape = function (config) {
    if (config && typeof config === 'object' && !isArray(config)) {
      return config.escape;
    }
  };

  var mustache = {
    name: 'mustache.js',
    version: '4.2.0',
    tags: ['{{', '}}'],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    set templateCache(cache) { defaultWriter.templateCache = cache; },
    get templateCache() { return defaultWriter.templateCache; }
  };

  var defaultWriter = new Writer();

  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  mustache.parse = function (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  mustache.render = function (template, view, partials, config) {
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

})));
