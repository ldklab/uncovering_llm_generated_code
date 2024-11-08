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
const _OPTS_PASSABLE_WITH_DATA = [
  'delimiter', 'scope', 'context', 'debug', 'compileDebug',
  'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'
];
const _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat('cache');
const _BOM = /^\uFEFF/;

exports.cache = utils.cache;
exports.fileLoader = fs.readFileSync;
exports.localsName = _DEFAULT_LOCALS_NAME;
exports.promiseImpl = (new Function('return this;'))().Promise;

exports.resolveInclude = (name, filename, isDir) => {
  const includePath = path.resolve(isDir ? filename : path.dirname(filename), name);
  const ext = path.extname(name) || '.ejs';
  return includePath + ext;
};

function resolvePaths(name, paths) {
  let filePath;
  if (paths.some((v) => {
    filePath = exports.resolveInclude(name, v, true);
    return fs.existsSync(filePath);
  })) {
    return filePath;
  }
}

function getIncludePath(path, options) {
  let includePath;
  const views = options.views;
  const match = /^[A-Za-z]+:\\|^\//.exec(path);

  if (match) {
    path = path.replace(/^\/*/, '');
    includePath = Array.isArray(options.root)
      ? resolvePaths(path, options.root)
      : exports.resolveInclude(path, options.root || '/', true);
  } else {
    if (options.filename) {
      const filePath = exports.resolveInclude(path, options.filename);
      if (fs.existsSync(filePath)) includePath = filePath;
    }
    if (!includePath && Array.isArray(views)) {
      includePath = resolvePaths(path, views);
    }
    if (!includePath) {
      throw new Error(`Could not find the include file "${options.escapeFunction(path)}"`);
    }
  }
  return includePath;
}

function handleCache(options, template) {
  let func;
  const filename = options.filename;
  const hasTemplate = arguments.length > 1;

  if (options.cache) {
    if (!filename) throw new Error('cache option requires a filename');
    func = exports.cache.get(filename);
    if (func) return func;
    if (!hasTemplate) {
      template = fileLoader(filename).toString().replace(_BOM, '');
    }
  } else if (!hasTemplate) {
    if (!filename) throw new Error('Internal EJS error: no file name or template provided');
    template = fileLoader(filename).toString().replace(_BOM, '');
  }
  func = exports.compile(template, options);
  if (options.cache) {
    exports.cache.set(filename, func);
  }
  return func;
}

function tryHandleCache(options, data, cb) {
  let result;
  if (!cb) {
    if (typeof exports.promiseImpl == 'function') {
      return new exports.promiseImpl((resolve, reject) => {
        try {
          result = handleCache(options)(data);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    }
    throw new Error('Please provide a callback function');
  }

  try {
    result = handleCache(options)(data);
  } catch (err) {
    return cb(err);
  }

  cb(null, result);
}

function fileLoader(filePath) {
  return exports.fileLoader(filePath);
}

function includeFile(path, options) {
  const opts = utils.shallowCopy({}, options);
  opts.filename = getIncludePath(path, opts);
  if (typeof options.includer === 'function') {
    const includerResult = options.includer(path, opts.filename);
    if (includerResult) {
      if (includerResult.filename) opts.filename = includerResult.filename;
      if (includerResult.template) return handleCache(opts, includerResult.template);
    }
  }
  return handleCache(opts);
}

function rethrow(err, str, flnm, lineno, esc) {
  const lines = str.split('\n');
  const start = Math.max(lineno - 3, 0);
  const end = Math.min(lines.length, lineno + 3);
  const filename = esc(flnm);
  const context = lines.slice(start, end).map((line, i) =>
    (i + start + 1 === lineno ? ' >> ' : '    ') + (i + start + 1) + '| ' + line
  ).join('\n');

  err.path = filename;
  err.message = `${filename || 'ejs'}:${lineno}\n${context}\n\n${err.message}`;
  throw err;
}

function stripSemi(str) {
  return str.replace(/;(\s*$)/, '$1');
}

exports.compile = function compile(template, opts) {
  if (opts && opts.scope) {
    if (!scopeOptionWarned) {
      console.warn('`scope` option is deprecated and will be removed in EJS 3');
      scopeOptionWarned = true;
    }
    if (!opts.context) opts.context = opts.scope;
    delete opts.scope;
  }
  const templ = new Template(template, opts);
  return templ.compile();
};

exports.render = function(template, d, o) {
  const data = d || {};
  const opts = o || {};
  if (arguments.length === 2) {
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
  }
  return handleCache(opts, template)(data);
};

exports.renderFile = function() {
  const args = Array.prototype.slice.call(arguments);
  const filename = args.shift();
  let cb;
  const opts = { filename };
  let data;
  let viewOpts;

  if (typeof arguments[arguments.length - 1] === 'function') {
    cb = args.pop();
  }

  if (args.length) {
    data = args.shift();
    if (args.length) {
      utils.shallowCopy(opts, args.pop());
    } else {
      if (data.settings) {
        if (data.settings.views) {
          opts.views = data.settings.views;
        }
        if (data.settings['view cache']) {
          opts.cache = true;
        }
        viewOpts = data.settings['view options'];
        if (viewOpts) {
          utils.shallowCopy(opts, viewOpts);
        }
      }
      utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
    }
    opts.filename = filename;
  } else {
    data = {};
  }

  return tryHandleCache(opts, data, cb);
};

exports.clearCache = function() {
  exports.cache.reset();
};

function Template(text, opts) {
  opts = opts || {};
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
  createRegex: function() {
    let str = _REGEX_STRING;
    const delim = utils.escapeRegExpChars(this.opts.delimiter);
    const open = utils.escapeRegExpChars(this.opts.openDelimiter);
    const close = utils.escapeRegExpChars(this.opts.closeDelimiter);
    str = str.replace(/%/g, delim).replace(/</g, open).replace(/>/g, close);
    return new RegExp(str);
  },

  compile: function() {
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
        const destructuring = `  var __locals = (${opts.localsName} || {}),\n` +
          opts.destructuredLocals.map(name => `  ${name} = __locals.${name}`).join(',\n') + ';\n';
        prepended += destructuring;
      }
      if (opts._with !== false) {
        prepended += `  with (${opts.localsName} || {}) {\n`;
        appended += '  }\n';
      }
      appended += '  return __output;\n';
      this.source = prepended + this.source + appended;
    }

    if (opts.compileDebug) {
      src = `var __line = 1\n  , __lines = ${JSON.stringify(this.templateText)}\n` +
        `  , __filename = ${opts.filename ? JSON.stringify(opts.filename) : 'undefined'};\n` +
        `try {\n${this.source}} catch (e) {\n  rethrow(e, __lines, __filename, __line, escapeFn);\n}\n`;
    } else {
      src = this.source;
    }

    if (opts.client) {
      src = `escapeFn = escapeFn || ${escapeFn.toString()};\n${src}`;
      if (opts.compileDebug) {
        src = `rethrow = rethrow || ${rethrow.toString()};\n${src}`;
      }
    }

    if (opts.strict) {
      src = `"use strict";\n${src}`;
    }
    if (opts.debug) {
      console.log(src);
    }
    if (opts.compileDebug && opts.filename) {
      src = `${src}\n//# sourceURL=${opts.filename}\n`;
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
        if (opts.filename) {
          e.message += ` in ${opts.filename}`;
        }
        e.message += ' while compiling ejs\n\n';
        e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
        e.message += 'https://github.com/RyanZim/EJS-Lint';
        if (!opts.async) {
          e.message += '\n';
          e.message += 'Or, if you meant to create an async function, pass `async: true` as an option.';
        }
      }
      throw e;
    }

    const returnedFn = opts.client ? fn : function anonymous(data) {
      const include = (path, includeData) => {
        const d = utils.shallowCopy({}, data);
        if (includeData) {
          return includeFile(path, opts)(utils.shallowCopy(d, includeData));
        }
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
      } catch (e) { /* ignore */ }
    }
    return returnedFn;
  },

  generateSource: function() {
    const opts = this.opts;

    if (opts.rmWhitespace) {
      this.templateText = this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
    }

    this.templateText = this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

    const matches = this.parseTemplateText();
    const d = this.opts.delimiter;
    const o = this.opts.openDelimiter;
    const c = this.opts.closeDelimiter;

    if (matches && matches.length) {
      matches.forEach((line) => {
        let closing;
        if (line.indexOf(o + d) === 0 && line.indexOf(o + d + d) !== 0) {
          closing = matches[matches.indexOf(line) + 2];
          if (!(closing === d + c || closing === '-' + d + c || closing === '_' + d + c)) {
            throw new Error(`Could not find matching close tag for "${line}".`);
          }
        }
        this.scanLine(line);
      });
    }
  },

  parseTemplateText: function() {
    let str = this.templateText;
    const pat = this.regex;
    const arr = [];
    let result = pat.exec(str);
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

  _addOutput: function(line) {
    if (this.truncate) {
      line = line.replace(/^(?:\r\n|\r|\n)/, '');
      this.truncate = false;
    }
    if (!line) return line;

    line = line.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"');
    this.source += `    ; __append("${line}")\n`;
  },

  scanLine: function(line) {
    const d = this.opts.delimiter;
    const o = this.opts.openDelimiter;
    const c = this.opts.closeDelimiter;
    const newLineCount = (line.split('\n').length - 1);

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
        this.source += `    ; __append("${line.replace(o + d + d, o + d)}")\n`;
        break;
      case d + d + c:
        this.mode = Template.modes.LITERAL;
        this.source += `    ; __append("${line.replace(d + d + c, d + c)}")\n`;
        break;
      case d + c:
      case '-' + d + c:
      case '_' + d + c:
        if (this.mode === Template.modes.LITERAL) {
          this._addOutput(line);
        }
        this.mode = null;
        this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
        break;
      default:
        if (this.mode) {
          if (this.mode === Template.modes.EVAL) {
            line = line.lastIndexOf('//') > line.lastIndexOf('\n') ? line + '\n' : line;
            this.source += `    ; ${line}\n`;
          } else if (this.mode === Template.modes.ESCAPED) {
            this.source += `    ; __append(escapeFn(${stripSemi(line)}))\n`;
          } else if (this.mode === Template.modes.RAW) {
            this.source += `    ; __append(${stripSemi(line)})\n`;
          } else if (this.mode === Template.modes.LITERAL) {
            this._addOutput(line);
          }
        } else {
          this._addOutput(line);
        }
    }

    if (this.opts.compileDebug && newLineCount) {
      this.currentLine += newLineCount;
      this.source += `    ; __line = ${this.currentLine}\n`;
    }
  }
};

exports.escapeXML = utils.escapeXML;
exports.__express = exports.renderFile;
exports.VERSION = _VERSION_STRING;
exports.name = _NAME;

if (typeof window !== 'undefined') {
  window.ejs = exports;
}
