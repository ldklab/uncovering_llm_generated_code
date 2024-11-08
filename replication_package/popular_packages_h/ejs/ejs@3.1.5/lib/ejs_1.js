'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('./utils');

let scopeOptionWarned = false;
const _VERSION_STRING = require('../package.json').version;
const _DEFAULT_OPEN_DELIMITER = '<';
const _DEFAULT_CLOSE_DELIMITER = '>';
const _DEFAULT_DELIMITER = '%';
const _DEFAULT_LOCALS_NAME = 'locals';
const _NAME = 'ejs';
const _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
const _OPTS_PASSABLE_WITH_DATA = ['delimiter', 'scope', 'context', 'debug', 'compileDebug', 'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'];
const _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat('cache');
const _BOM = /^\uFEFF/;

exports.cache = utils.cache;
exports.fileLoader = fs.readFileSync;
exports.localsName = _DEFAULT_LOCALS_NAME;
exports.promiseImpl = (new Function('return this;'))().Promise;

exports.resolveInclude = function(name, filename, isDir) {
  const dir = path.dirname;
  const ext = path.extname;
  const resolve = path.resolve;
  let includePath = resolve(isDir ? filename : dir(filename), name);
  if (!ext(name)) includePath += '.ejs';
  return includePath;
};

function resolvePaths(name, paths) {
  let filePath;
  if (paths.some(v => {
    filePath = exports.resolveInclude(name, v, true);
    return fs.existsSync(filePath);
  })) return filePath;
}

function getIncludePath(name, options) {
  let includePath;
  let filePath;
  const views = options.views;
  const absPathPattern = /^[A-Za-z]+:\\|^\//;

  if (absPathPattern.test(name)) {
    name = name.replace(/^\/*/, '');
    includePath = Array.isArray(options.root) ? resolvePaths(name, options.root) : exports.resolveInclude(name, options.root || '/', true);
  } else {
    if (options.filename) {
      filePath = exports.resolveInclude(name, options.filename);
      if (fs.existsSync(filePath)) includePath = filePath;
    }
    if (!includePath && Array.isArray(views)) includePath = resolvePaths(name, views);

    if (!includePath && typeof options.includer !== 'function') {
      throw new Error(`Could not find the include file "${options.escapeFunction(name)}"`);
    }
  }

  return includePath;
}

function handleCache(options, template) {
  let func;
  const filename = options.filename;
  
  if (options.cache) {
    if (!filename) throw new Error('cache option requires a filename');
    func = exports.cache.get(filename);
    if (func) return func;
    if (!template) template = exports.fileLoader(filename).toString().replace(_BOM, '');
  } else if (!template) {
    if (!filename) throw new Error('Internal EJS error: no file name or template provided');
    template = exports.fileLoader(filename).toString().replace(_BOM, '');
  }

  func = exports.compile(template, options);
  if (options.cache) exports.cache.set(filename, func);
  
  return func;
}

function tryHandleCache(options, data, cb) {
  let result;
  if (!cb) {
    if (typeof exports.promiseImpl === 'function') {
      return new exports.promiseImpl((resolve, reject) => {
        try {
          result = handleCache(options)(data);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    } else {
      throw new Error('Please provide a callback function');
    }
  } else {
    try {
      result = handleCache(options)(data);
      cb(null, result);
    } catch (err) {
      cb(err);
    }
  }
}

exports.render = function (template, d = {}, o = {}) {
  const data = d;
  const opts = o;

  if (arguments.length == 2) {
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
  }

  return handleCache(opts, template)(data);
};

exports.renderFile = function () {
  const args = Array.prototype.slice.call(arguments);
  const filename = args.shift();
  let cb;
  const opts = { filename };
  let data;

  if (typeof arguments[arguments.length - 1] === 'function') cb = args.pop();
  if (args.length) {
    data = args.shift();
    if (args.length) {
      utils.shallowCopy(opts, args.pop());
    } else {
      if (data.settings) {
        if (data.settings.views) opts.views = data.settings.views;
        if (data.settings['view cache']) opts.cache = true;
        const viewOpts = data.settings['view options'];
        if (viewOpts) utils.shallowCopy(opts, viewOpts);
      }
      utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
    }
    opts.filename = filename;
  } else {
    data = {};
  }

  return tryHandleCache(opts, data, cb);
};

exports.clearCache = function () {
  exports.cache.reset();
};

exports.Template = Template;

function Template(text, opts = {}) {
  const options = {};
  this.templateText = text;
  this.mode = null;
  this.truncate = false;
  this.currentLine = 1;
  this.source = '';
  options.client = opts.client || false;
  options.escapeFunction = opts.escape || opts.escapeFunction || utils.escapeXML;
  options.compileDebug = opts.compileDebug !== false;
  options.debug = !!opts.debug;
  options.filename = opts.filename;
  options.openDelimiter = opts.openDelimiter || exports.openDelimiter || _DEFAULT_OPEN_DELIMITER;
  options.closeDelimiter = opts.closeDelimiter || exports.closeDelimiter || _DEFAULT_CLOSE_DELIMITER;
  options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
  options.strict = opts.strict || false;
  options.context = opts.context;
  options.cache = opts.cache || false;
  options.rmWhitespace = opts.rmWhitespace;
  options.root = opts.root;
  options.includer = opts.includer;
  options.outputFunctionName = opts.outputFunctionName;
  options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;
  options.views = opts.views;
  options.async = opts.async;
  options.destructuredLocals = opts.destructuredLocals;
  options.legacyInclude = typeof opts.legacyInclude !== 'undefined' ? !!opts.legacyInclude : true;

  if (options.strict) {
    options._with = false;
  } else {
    options._with = typeof opts._with !== 'undefined' ? opts._with : true;
  }

  this.opts = options;
  this.regex = this.createRegex();
}

Template.modes = {
  EVAL: 'eval',
  ESCAPED: 'escaped',
  RAW: 'raw',
  COMMENT: 'comment',
  LITERAL: 'literal'
};

Template.prototype = {
  createRegex: function () {
    let str = _REGEX_STRING;
    const delim = utils.escapeRegExpChars(this.opts.delimiter);
    const open = utils.escapeRegExpChars(this.opts.openDelimiter);
    const close = utils.escapeRegExpChars(this.opts.closeDelimiter);
    str = str.replace(/%/g, delim).replace(/</g, open).replace(/>/g, close);
    return new RegExp(str);
  },

  compile: function () {
    let src;
    let fn;
    const opts = this.opts;
    let prepended = '';
    let appended = '';
    const escapeFn = opts.escapeFunction;
    let ctor;

    if (!this.source) {
      this.generateSource();
      prepended += '  var __output = "";\n  function __append(s) { if (s !== undefined && s !== null) __output += s }\n';
      if (opts.outputFunctionName) {
        prepended += `  var ${opts.outputFunctionName} = __append;\n`;
      }
      if (opts.destructuredLocals && opts.destructuredLocals.length) {
        let destructuring = `  var __locals = (${opts.localsName} || {}),\n`;
        for (let i = 0; i < opts.destructuredLocals.length; i++) {
          const name = opts.destructuredLocals[i];
          if (i > 0) destructuring += ',\n  ';
          destructuring += `${name} = __locals.${name}`;
        }
        prepended += destructuring + ';\n';
      }
      if (opts._with !== false) {
        prepended += `  with (${opts.localsName} || {}) {\n`;
        appended += '  }\n';
      }
      appended += '  return __output;\n';
      this.source = prepended + this.source + appended;
    }

    if (opts.compileDebug) {
      src = `var __line = 1\n  , __lines = ${JSON.stringify(this.templateText)}\n  , __filename = ${opts.filename ? JSON.stringify(opts.filename) : 'undefined'};\ntry {\n${this.source}} catch (e) {\n  rethrow(e, __lines, __filename, __line, escapeFn);\n}\n`;
    } else {
      src = this.source;
    }

    if (opts.client) {
      src = `escapeFn = escapeFn || ${escapeFn.toString()};\n` + src;
      if (opts.compileDebug) {
        src = `rethrow = rethrow || ${rethrow.toString()};\n` + src;
      }
    }

    if (opts.strict) {
      src = `"use strict";\n` + src;
    }
    if (opts.debug) {
      console.log(src);
    }
    if (opts.compileDebug && opts.filename) {
      src = src + '\n' + `//# sourceURL=${opts.filename}\n`;
    }

    try {
      if (opts.async) {
        try {
          ctor = (new Function('return (async function(){}).constructor;'))();
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error('This environment does not support async/await');
          } else {
            throw e;
          }
        }
      } else {
        ctor = Function;
      }
      fn = new ctor(opts.localsName + ', escapeFn, include, rethrow', src);
    } catch (e) {
      if (e instanceof SyntaxError) {
        if (opts.filename) e.message += ` in ${opts.filename}`;
        e.message += ' while compiling ejs\n\nIf the above error is not helpful, you may want to try EJS-Lint:\nhttps://github.com/RyanZim/EJS-Lint';
        if (!opts.async) {
          e.message += '\n' + 'Or, if you meant to create an async function, pass `async: true` as an option.';
        }
      }
      throw e;
    }

    const returnedFn = opts.client ? fn : function anonymous(data) {
      const include = function (path, includeData) {
        let d = utils.shallowCopy({}, data);
        if (includeData) d = utils.shallowCopy(d, includeData);
        return includeFile(path, opts)(d);
      };
      return fn.apply(opts.context, [data || {}, escapeFn, include, rethrow]);
    };
    if (opts.filename && typeof Object.defineProperty === 'function') {
      const filename = opts.filename;
      const basename = path.basename(filename, path.extname(filename));
      try {
        Object.defineProperty(returnedFn, 'name', {
          value: basename,
          writable: false,
          enumerable: false,
          configurable: true
        });
      } catch (e) {}
    }
    return returnedFn;
  },

  generateSource: function () {
    const opts = this.opts;

    if (opts.rmWhitespace) {
      this.templateText = this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
    }

    this.templateText = this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

    const self = this;
    const matches = this.parseTemplateText();
    const d = this.opts.delimiter;
    const o = this.opts.openDelimiter;
    const c = this.opts.closeDelimiter;

    if (matches && matches.length) {
      matches.forEach(function (line, index) {
        let closing;
        if (line.indexOf(o + d) === 0 && line.indexOf(o + d + d) !== 0) {
          closing = matches[index + 2];
          if (!(closing == d + c || closing == '-' + d + c || closing == '_' + d + c)) {
            throw new Error('Could not find matching close tag for "' + line + '".');
          }
        }
        self.scanLine(line);
      });
    }
  },

  parseTemplateText: function () {
    let str = this.templateText;
    const pat = this.regex;
    let result = pat.exec(str);
    const arr = [];
    let firstPos;

    while (result) {
      firstPos = result.index;
      if (firstPos !== 0) {
        arr.push(str.substring(0, firstPos));
        str = str.slice(firstPos);
      }
      arr.push(result[0]);
      str = str.slice(result[0].length);
      result = pat.exec(str);
    }

    if (str) {
      arr.push(str);
    }

    return arr;
  },

  _addOutput: function (line) {
    if (this.truncate) {
      line = line.replace(/^(?:\r\n|\r|\n)/, '');
      this.truncate = false;
    }
    if (!line) return line;

    line = line.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"');
    this.source += '    ; __append("' + line + '")' + '\n';
  },

  scanLine: function (line) {
    const self = this;
    const d = this.opts.delimiter;
    const o = this.opts.openDelimiter;
    const c = this.opts.closeDelimiter;
    let newLineCount = (line.split('\n').length - 1);

    switch (line) {
      case o + d:
      case o + d + '_':
        this.mode = Template.modes.EVAL;
        break;
      case o + d + '=':
        this.mode = Template.modes.ESCAPED;
        break;
      case o + d + '-':
        this.mode = Template.modes.RAW;
        break;
      case o + d + '#':
        this.mode = Template.modes.COMMENT;
        break;
      case o + d + d:
        this.mode = Template.modes.LITERAL;
        this.source += '    ; __append("' + line.replace(o + d + d, o + d) + '")' + '\n';
        break;
      case d + d + c:
        this.mode = Template.modes.LITERAL;
        this.source += '    ; __append("' + line.replace(d + d + c, d + c) + '")' + '\n';
        break;
      case d + c:
      case '-' + d + c:
      case '_' + d + c:
        if (this.mode == Template.modes.LITERAL) this._addOutput(line);
        this.mode = null;
        this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
        break;
      default:
        if (this.mode) {
          if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
            line += '\n';
          }
          switch (this.mode) {
            case Template.modes.EVAL:
              this.source += '    ; ' + line + '\n';
              break;
            case Template.modes.ESCAPED:
              this.source += '    ; __append(escapeFn(' + stripSemi(line) + '))' + '\n';
              break;
            case Template.modes.RAW:
              this.source += '    ; __append(' + stripSemi(line) + ')' + '\n';
              break;
            case Template.modes.COMMENT:
              break;
            case Template.modes.LITERAL:
              this._addOutput(line);
              break;
          }
        } else {
          this._addOutput(line);
        }
    }

    if (self.opts.compileDebug && newLineCount) {
      this.currentLine += newLineCount;
      this.source += '    ; __line = ' + this.currentLine + '\n';
    }
  }
};

exports.escapeXML = utils.escapeXML;
exports.__express = exports.renderFile;
exports.VERSION = _VERSION_STRING;
exports.name = _NAME;

if (typeof window != 'undefined') {
  window.ejs = exports;
}
