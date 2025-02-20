'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('./utils');

const _VERSION_STRING = require('../package.json').version;
const _DEFAULT_OPEN_DELIMITER = '<';
const _DEFAULT_CLOSE_DELIMITER = '>';
const _DEFAULT_DELIMITER = '%';
const _DEFAULT_LOCALS_NAME = 'locals';
const _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
const _OPTS_PASSABLE_WITH_DATA = ['delimiter', 'context', 'debug', 'compileDebug', 'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'];
const _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat('cache');
const _BOM = /^\uFEFF/;
const _JS_IDENTIFIER = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

exports.cache = utils.cache;
exports.fileLoader = fs.readFileSync;
exports.localsName = _DEFAULT_LOCALS_NAME;
exports.promiseImpl = (new Function('return this;'))().Promise;

/**
 * Resolves included file paths based on provided name and parent filename.
 */
exports.resolveInclude = function(name, filename, isDir) {
  const dirname = path.dirname;
  const extname = path.extname;
  const resolve = path.resolve;
  let includePath = resolve(isDir ? filename : dirname(filename), name);
  const ext = extname(name);
  if (!ext) {
    includePath += '.ejs';
  }
  return includePath;
};

function resolvePaths(name, paths) {
  let filePath;
  if (paths.some(v => (filePath = exports.resolveInclude(name, v, true), fs.existsSync(filePath)))) {
    return filePath;
  }
}

/**
 * Get the path for included files, try in root and views directories.
 */
function getIncludePath(filepath, options) {
  let includePath;
  const match = /^[A-Za-z]+:\\|^\//.exec(filepath);

  if (match && match.length) {
    filepath = filepath.replace(/^\/*/, '');
    includePath = Array.isArray(options.root) ? resolvePaths(filepath, options.root) : exports.resolveInclude(filepath, options.root || '/', true);
  } else {
    let filePath;
    if (options.filename) {
      filePath = exports.resolveInclude(filepath, options.filename);
      if (fs.existsSync(filePath)) {
        includePath = filePath;
      }
    }
    if (!includePath && Array.isArray(options.views)) {
      includePath = resolvePaths(filepath, options.views);
    }
    if (!includePath && typeof options.includer !== 'function') {
      throw new Error(`Could not find the include file "${options.escapeFunction(filepath)}"`);
    }
  }
  return includePath;
}

/**
 * Handles template caching for compiled templates.
 */
function handleCache(options, template) {
  let func;
  const filename = options.filename;
  const hasTemplate = arguments.length > 1;

  if (options.cache) {
    if (!filename) {
      throw new Error('cache option requires a filename');
    }
    func = exports.cache.get(filename);
    if (func) {
      return func;
    }
    if (!hasTemplate) {
      template = fileLoader(filename).toString().replace(_BOM, '');
    }
  } else if (!hasTemplate) {
    if (!filename) {
      throw new Error('no filename or template provided');
    }
    template = fileLoader(filename).toString().replace(_BOM, '');
  }
  func = exports.compile(template, options);
  if (options.cache) {
    exports.cache.set(filename, func);
  }
  return func;
}

/**
 * Attempt handleCache and resolve callback with result or error.
 */
function tryHandleCache(options, data, cb) {
  if (!cb) {
    if (typeof exports.promiseImpl == 'function') {
      return new exports.promiseImpl((resolve, reject) => {
          try {
            resolve(handleCache(options)(data));
          } catch (err) {
            reject(err);
          }
      });
    } else {
      throw new Error('Callback is required');
    }
  } else {
    try {
      cb(null, handleCache(options)(data));
    } catch (err) {
      cb(err);
    }
  }
}

function fileLoader(filePath) {
  return exports.fileLoader(filePath);
}

function includeFile(filepath, options) {
  const opts = utils.shallowCopy(utils.createNullProtoObjWherePossible(), options);
  opts.filename = getIncludePath(filepath, opts);
  if (typeof options.includer === 'function') {
    const includerResult = options.includer(filepath, opts.filename);
    if (includerResult) {
      if (includerResult.filename) {
        opts.filename = includerResult.filename;
      }
      if (includerResult.template) {
        return handleCache(opts, includerResult.template);
      }
    }
  }
  return handleCache(opts);
}

function rethrow(err, str, filename, lineno, esc) {
  const lines = str.split('\n');
  const context = lines.slice(Math.max(lineno - 3, 0), Math.min(lines.length, lineno + 3)).map((line, i) => `${i + lineno - 2 == lineno ? ' >> ' : '    '}${i + lineno - 2}| ${line}`);
  err.path = esc(filename);
  err.message = `${filename || 'ejs'}:${lineno}\n${context.join('\n')}\n\n${err.message}`;
  throw err;
}

function stripSemi(str) {
  return str.replace(/;(\s*$)/, '$1');
}

exports.compile = function compile(template, opts) {
  if (opts && opts.scope) {
    console.warn('`scope` option is deprecated');
    opts.context = opts.context || opts.scope;
    delete opts.scope;
  }
  const templ = new Template(template, opts);
  return templ.compile();
};

exports.render = function (template, data = utils.createNullProtoObjWherePossible(), opts = utils.createNullProtoObjWherePossible()) {
  if (arguments.length == 2) {
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
  }
  return handleCache(opts, template)(data);
};

exports.renderFile = function (path, data = {}, opts = {}, cb) {
  if (arguments.length < 3 && typeof arguments[arguments.length - 1] != 'function') {
    throw new Error('Callback is required');
  }
  const args = Array.from(arguments);
  const filename = args.shift();
  if (typeof arguments[arguments.length - 1] == 'function') {
    cb = args.pop();
  }
  let viewOpts;
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
  }
  return tryHandleCache(opts, data, cb);
};

exports.clearCache = function () {
  exports.cache.reset();
};

function Template(text, opts) {
  opts = utils.hasOwnOnlyObject(opts);
  this.templateText = text;
  this.mode = null;
  this.truncate = false;
  this.currentLine = 1;
  this.source = '';
  this.opts = {
    client: opts.client || false,
    escapeFunction: opts.escape || opts.escapeFunction || utils.escapeXML,
    compileDebug: opts.compileDebug !== false,
    debug: !!opts.debug,
    filename: opts.filename,
    openDelimiter: opts.openDelimiter || exports.openDelimiter || _DEFAULT_OPEN_DELIMITER,
    closeDelimiter: opts.closeDelimiter || exports.closeDelimiter || _DEFAULT_CLOSE_DELIMITER,
    delimiter: opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER,
    strict: opts.strict || false,
    context: opts.context,
    cache: opts.cache || false,
    rmWhitespace: opts.rmWhitespace,
    root: opts.root,
    includer: opts.includer,
    outputFunctionName: opts.outputFunctionName,
    localsName: opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME,
    views: opts.views,
    async: opts.async,
    destructuredLocals: opts.destructuredLocals,
    legacyInclude: typeof opts.legacyInclude != 'undefined' ? !!opts.legacyInclude : true,
    _with: opts.strict ? false : opts._with != undefined ? opts._with : true
  };
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
    return new RegExp(_REGEX_STRING.replace(/%/g, utils.escapeRegExpChars(this.opts.delimiter)).replace(/</g, utils.escapeRegExpChars(this.opts.openDelimiter)).replace(/>/g, utils.escapeRegExpChars(this.opts.closeDelimiter)));
  },

  compile: function () {
    if (!this.source) {
      this.generateSource();
      const outputFunctionName = this.opts.outputFunctionName;
      const sanitizedFilename = this.opts.filename ? JSON.stringify(this.opts.filename) : 'undefined';
      if (this.opts.compileDebug) {
        this.source = `var __line = 1
  , __lines = ${JSON.stringify(this.templateText)}
  , __filename = ${sanitizedFilename};
try {
${this.source}
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}`;
      }
      if (this.opts.client) {
        const escapeFnSource = `escapeFn = escapeFn || ${this.opts.escapeFunction.toString()};\n`;
        this.source = escapeFnSource + this.source;
        if (this.opts.compileDebug) {
          const rethrowSource = `rethrow = rethrow || ${rethrow.toString()};\n`;
          this.source = rethrowSource + this.source;
        }
      }
      if (this.opts.strict) {
        this.source = '"use strict";\n' + this.source;
      }
      if (this.opts.debug) {
        console.log(this.source);
      }
    }
    let ctor;
    try {
      if (this.opts.async) {
        try {
          ctor = (new Function('return (async function(){}).constructor;'))();
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error('This environment does not support async/await');
          }
          throw e;
        }
      } else {
        ctor = Function;
      }
      const fn = new ctor(this.opts.localsName + ', escapeFn, include, rethrow', this.source);
      const outputFunction = this.opts.outputFunctionName;
      const dataObject = utils.createNullProtoObjWherePossible();
      if (this.opts.filename && typeof Object.defineProperty === 'function') {
        const filename = this.opts.filename;
        const basename = path.basename(filename, path.extname(filename));
        try {
          Object.defineProperty(fn, 'name', {value: basename, writable: false, enumerable: false, configurable: true});
        } catch (e) {}
      }
      return this.opts.client ? fn : function (data) {
        const include = (path, includeData) => {
          const d = Object.assign({}, data || dataObject);
          if (includeData) {
            Object.assign(d, includeData);
          }
          return includeFile(path, this.opts)(d);
        };
        return fn.call(this.opts.context, data || dataObject, escapeFn, include, rethrow);
      };
    } catch (e) {
      if (e instanceof SyntaxError) {
        if (this.opts.filename) {
          e.message += ` in ${this.opts.filename}`;
        }
        e.message += ' while compiling ejs. '
        + 'If the above error is not helpful, '
        + 'see EJS-Lint: https://github.com/RyanZim/EJS-Lint';
        if (!this.opts.async) {
          e.message += '\nOr, if intended as an async function, pass `async: true`.';
        }
      }
      throw e;
    }
  },

  generateSource: function () {
    const rmWhitespace = this.opts.rmWhitespace;
    if (rmWhitespace) {
      this.templateText = this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
    }
    this.templateText = this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');
    const matches = this.parseTemplateText();
    const d = this.opts.delimiter;
    const o = this.opts.openDelimiter;
    const c = this.opts.closeDelimiter;

    matches.forEach((line, index) => {
      let closing;
      if (line.indexOf(o + d) === 0 && line.indexOf(o + d + d) !== 0) {
        closing = matches[index + 2];
        if (!(closing == d + c || closing == '-' + d + c || closing == '_' + d + c)) {
          throw new Error(`Could not find a matching close tag for "${line}".`);
        }
      }
      this.scanLine(line);
    });
  },

  parseTemplateText: function () {
    const pat = this.regex;
    let result;
    const arr = [];
    while ((result = pat.exec(this.templateText)) !== null) {
      const firstPos = result.index;
      if (firstPos !== 0) {
        arr.push(this.templateText.substring(0, firstPos));
        this.templateText = this.templateText.slice(firstPos);
      }
      arr.push(result[0]);
      this.templateText = this.templateText.slice(result[0].length);
    }
    if (this.templateText) {
      arr.push(this.templateText);
    }
    return arr;
  },

  _addOutput: function (line) {
    if (this.truncate) {
      line = line.replace(/^(?:\r\n|\r|\n)/, '');
      this.truncate = false;
    }
    if (!line) return line;

    line = line.replace(/\\/g, '\\\\');
    line = line.replace(/\n/g, '\\n');
    line = line.replace(/\r/g, '\\r');
    line = line.replace(/"/g, '\\"');
    this.source += `    ; __append("${line}")\n`;
  },

  scanLine: function (line) {
    const d = this.opts.delimiter;
    const o = this.opts.openDelimiter;
    const c = this.opts.closeDelimiter;
    let newLineCount = 0;
    newLineCount = (line.split('\n').length - 1);

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
        if (this.mode == Template.modes.LITERAL) {
          this._addOutput(line);
        }
        this.mode = null;
        this.truncate = line.startsWith('-') || line.startsWith('_');
        break;
      default:
        if (this.mode) {
          if (this.mode == Template.modes.EVAL || this.mode == Template.modes.ESCAPED || this.mode == Template.modes.RAW) {
            if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
              line += '\n';
            }
          }
          switch (this.mode) {
            case Template.modes.EVAL:
              this.source += `    ; ${line}\n`;
              break;
            case Template.modes.ESCAPED:
              this.source += `    ; __append(escapeFn(${stripSemi(line)}))\n`;
              break;
            case Template.modes.RAW:
              this.source += `    ; __append(${stripSemi(line)})\n`;
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
      this.source += `    ; __line = ${this.currentLine}\n`;
    }
  }
};

exports.escapeXML = utils.escapeXML;
exports.__express = exports.renderFile;
exports.VERSION = _VERSION_STRING;
exports.name = 'ejs';

if (typeof window != 'undefined') {
  window.ejs = exports;
}
