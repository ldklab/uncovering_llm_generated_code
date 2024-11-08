markdown
'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

var cacheEnabled = false;
var cache = utils.cache;
var fileLoader = fs.readFileSync;
var _DEFAULT_LOCALS_NAME = 'locals';
var _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
var _DEFAULT_OPEN_DELIMITER = '<';
var _DEFAULT_CLOSE_DELIMITER = '>';
var _DEFAULT_DELIMITER = '%';

exports.fileLoader = function(filePath) {
  return fileLoader(filePath);
};

function resolveInclude(name, filename, isDir) {
  var includePath = path.resolve(isDir ? filename : path.dirname(filename), name);
  if (!path.extname(name)) {
    includePath += '.ejs';
  }
  return includePath;
}

function render(template, data, options) {
  options = options || {};
  data = data || {};
  Object.assign(options, { localsName: _DEFAULT_LOCALS_NAME });
  return compile(template, options)(data);
}

function compile(template, options) {
  options = options || {};
  var templ = new Template(template, options);
  return templ.compile();
}

function handleCache(options, template) {
  var func;
  var filename = options.filename;
  var hasTemplate = arguments.length > 1;

  if (options.cache && filename) {
    func = cache.get(filename);
    if (func) return func;
    if (!hasTemplate) {
      template = fileLoader(filename).toString();
    }
  } else if (!hasTemplate) {
    template = fileLoader(filename).toString();
  }

  func = compile(template, options);
  if (options.cache && filename) {
    cache.set(filename, func);
  }
  return func;
}

exports.renderFile = function (path, data, options, cb) {
  options = options || {};
  data = data || {};
  var opts = { filename: path };
  if (typeof cb !== 'function') throw new Error('Callback is required');
  
  try {
    var result = handleCache(opts, null)(data);
    cb(null, result);
  } catch (err) {
    cb(err);
  }
};

function Template(text, opts) {
  this.templateText = text;
  this.opts = opts;
  this.source = '';
  this.mode = null;
  this.regex = this.createRegex();
}

Template.prototype = {
  createRegex: function () {
    var str = _REGEX_STRING;
    var delim = utils.escapeRegExpChars(this.opts.delimiter || _DEFAULT_DELIMITER);
    var open = utils.escapeRegExpChars(this.opts.openDelimiter || _DEFAULT_OPEN_DELIMITER);
    var close = utils.escapeRegExpChars(this.opts.closeDelimiter || _DEFAULT_CLOSE_DELIMITER);
    str = str.replace(/%/g, delim).replace(/</g, open).replace(/>/g, close);
    return new RegExp(str);
  },

  compile: function () {
    var src = 'var __output = ""; var __append = function(s) { if (s !== null && s !== undefined) __output += s; };';
    src += this.parseTemplateText().concat(' return __output;').join('\n');
    try {
      var fn = new Function(this.opts.localsName || _DEFAULT_LOCALS_NAME, 'escapeFn', src);
      return fn;
    } catch (e) {
      throw e;
    }
  },

  parseTemplateText: function () {
    var str = this.templateText;
    var result = this.regex.exec(str);
    var arr = [], line;
    while (result) {
      line = str.slice(0, result.index);
      if (line) arr.push('__append(' + JSON.stringify(line) + ');');
      line = result[0];
      switch (line) {
        case '<%': arr.push(''); break;
        case '<%=': arr.push('__append(escapeFn('); break;
        case '<%-': arr.push('__append('); break;
        case '%>': arr.push(');'); break;
        default: arr.push('__append(' + JSON.stringify(line) + ');'); break;
      }
      str = str.slice(result.index + line.length);
      result = this.regex.exec(str);
    }
    if (str) arr.push('__append(' + JSON.stringify(str) + ');');
    return arr;
  }
};

exports.compile = compile;
exports.render = render;
exports.VERSION = require('../package.json').version;
exports.name = 'ejs';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = exports;
}
