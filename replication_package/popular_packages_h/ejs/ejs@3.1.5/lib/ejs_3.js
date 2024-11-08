'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('./utils');

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

exports.resolveInclude = function(name, filename, isDir = false) {
  const includePath = path.resolve(isDir ? filename : path.dirname(filename), name);
  return path.extname(name) ? includePath : includePath + '.ejs';
};

function resolvePaths(name, paths) {
  let filePath;
  if (paths.some(dir => {
    filePath = exports.resolveInclude(name, dir, true);
    return fs.existsSync(filePath);
  })) {
    return filePath;
  }
}

function getIncludePath(filePath, options) {
  let includePath;
  if (/^[A-Za-z]+:\\|^\//.test(filePath)) {
    filePath = filePath.replace(/^\/*/, '');
    includePath = Array.isArray(options.root) ? resolvePaths(filePath, options.root) 
               : exports.resolveInclude(filePath, options.root || '/', true);
  } else {
    if (options.filename) {
      includePath = exports.resolveInclude(filePath, options.filename);
      if (fs.existsSync(includePath)) return includePath;
    }
    if (Array.isArray(options.views)) {
      includePath = resolvePaths(filePath, options.views);
    }
    if (!includePath && typeof options.includer !== 'function') {
      throw new Error(`Could not find the include file "${options.escapeFunction(filePath)}"`);
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
  if (options.cache) {
    exports.cache.set(filename, func);
  }
  return func;
}

function tryHandleCache(options, data, cb) {
  if (!cb) {
    return new exports.promiseImpl((resolve, reject) => {
      try {
        const result = handleCache(options)(data);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }
  try {
    const result = handleCache(options)(data);
    cb(null, result);
  } catch (err) {
    cb(err);
  }
}

function fileLoader(filePath) {
  return exports.fileLoader(filePath);
}

function includeFile(path, options) {
  const opts = utils.shallowCopy({}, options);
  opts.filename = getIncludePath(path, opts);
  if (typeof options.includer === 'function') {
    const result = options.includer(path, opts.filename);
    if (result) {
      if (result.filename) opts.filename = result.filename;
      if (result.template) return handleCache(opts, result.template);
    }
  }
  return handleCache(opts);
}

function rethrow(err, str, flnm, lineno, esc) {
  const lines = str.split('\n');
  const start = Math.max(lineno - 3, 0);
  const end = Math.min(lines.length, lineno + 3);
  const context = lines.slice(start, end).map((line, i) => {
    return `${i + start + 1 == lineno ? ' >> ' : '    '}${i + start + 1}| ${line}`;
  }).join('\n');

  const filePath = esc(flnm);
  err.path = filePath;
  err.message = `${filePath || 'ejs'}:${lineno}\n${context}\n\n${err.message}`;
  throw err;
}

function stripSemi(str) {
  return str.replace(/;(\s*$)/, '$1');
}

exports.compile = function compile(template, opts = {}) {
  if (opts.scope && !opts.context) {
    console.warn('`scope` option is deprecated and will be removed in EJS 3');
    opts.context = opts.scope;
    delete opts.scope;
  }
  
  const templ = new Template(template, opts);
  return templ.compile();
};

exports.render = function (template, data = {}, opts = {}) {
  if (arguments.length == 2) {
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
  }
  return handleCache(opts, template)(data);
};

exports.renderFile = function (path, data = {}, opts = {}, cb) {
  if (typeof arguments[arguments.length - 1] == 'function') {
    cb = arguments[arguments.length - 1];
  }

  if (args.length) {
    utils.shallowCopy(opts, args.pop());
    if (data.settings) {
      opts.views = data.settings.views;
      opts.cache = data.settings['view cache'];
      if (data.settings['view options']) {
        utils.shallowCopy(opts, data.settings['view options']);
      }
    }
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
  }
  
  return tryHandleCache(opts, data, cb);
};

exports.clearCache = function () {
  exports.cache.reset();
};

exports.Template = Template;

function Template(text, opts) {
  this.templateText = text;
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
    legacyInclude: typeof opts.legacyInclude !== 'undefined' ? !!opts.legacyInclude : true,
    _with: opts.strict ? false : typeof opts._with !== 'undefined' ? opts._with : true,
  };
  this.currentLine = 1;
  this.source = '';
  this.mode = null;
  this.truncate = false;
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
    const { delimiter, openDelimiter, closeDelimiter } = this.opts;
    str = str.replace(/%/g, utils.escapeRegExpChars(delimiter))
             .replace(/</g, utils.escapeRegExpChars(openDelimiter))
             .replace(/>/g, utils.escapeRegExpChars(closeDelimiter));
    return new RegExp(str);
  },

  compile: function () {
    let src;
    const opts = this.opts;
    
    if (!this.source) {
      this.generateSource();
      this.source = `
        var __output = "";
        function __append(s) { if (s !== undefined && s !== null) __output += s }
        ${opts.outputFunctionName ? `var ${opts.outputFunctionName} = __append;` : ''}
        ${this.opts.destructuredLocals ? this.getDestructuredLocals() : ''}
        ${opts._with !== false ? `with (${opts.localsName} || {}) {` : ''}
        ${this.source}
        ${opts._with !== false ? '}' : ''}
        return __output;
      `;
    }

    if (opts.compileDebug) {
      src = this.getDebugSource();
    } else {
      src = this.source;
    }

    if (opts.client) {
      src = `escapeFn = escapeFn || ${opts.escapeFunction.toString()};\n` + src;
      if (opts.compileDebug) {
        src = `rethrow = rethrow || ${rethrow.toString()};\n` + src;
      }
    }

    if (opts.strict) src = '"use strict";\n' + src;
    if (opts.debug) console.log(src);
    if (opts.compileDebug && opts.filename) {
      src += `\n//# sourceURL=${opts.filename}\n`;
    }

    let fn;
    try {
      const ctor = this.getConstructor(opts.async);
      fn = new ctor(opts.localsName + ', escapeFn, include, rethrow', src);
    } catch (e) {
      if (e instanceof SyntaxError) {
        e.message += this.getSyntaxErrorMessage();
      }
      throw e;
    }

    return opts.client ? fn : this.getExecutableFunction(fn);
  },

  generateSource: function () {
    if (this.opts.rmWhitespace) {
      this.templateText = this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
    }

    this.templateText = this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');
    const matches = this.parseTemplateText();

    if (matches) {
      matches.forEach((line, index) => {
        if (/^<%[^%]/.test(line) && !/^<%%/.test(line) && !matches[index + 2].includes('%>')) {
          throw new Error(`Could not find matching close tag for "${line}".`);
        }
        this.scanLine(line);
      });
    }
  },

  parseTemplateText: function () {
    const result = [];
    let m;
    while ((m = this.regex.exec(this.templateText)) !== null) {
      if (m.index !== 0) {
        result.push(this.templateText.slice(0, m.index));
        this.templateText = this.templateText.slice(m.index);
      }
      result.push(m[0]);
      this.templateText = this.templateText.slice(m[0].length);
    }
    if (this.templateText) result.push(this.templateText);
    return result;
  },

  scanLine: function (line) {
    const newLineCount = (line.split('\n').length - 1);
    switch (line) {
      case '<%':
      case '<%_':
        this.mode = Template.modes.EVAL;
        break;
      case '<%=':
        this.mode = Template.modes.ESCAPED;
        break;
      case '<%-':
        this.mode = Template.modes.RAW;
        break;
      case '<%#':
        this.mode = Template.modes.COMMENT;
        break;
      case '<%%':
        this.mode = Template.modes.LITERAL;
        this.source += '    ; __append("' + line.replace('<%%', '<%') + '")' + '\n';
        break;
      case '%>':
      case '-%>':
      case '_%>':
        if (this.mode == Template.modes.LITERAL) this._addOutput(line);

        this.mode = null;
        this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
        break;
      default:
        if (this.mode) {
          this.handleMode(line);
        } else {
          this._addOutput(line);
        }
    }

    if (this.opts.compileDebug && newLineCount) {
      this.currentLine += newLineCount;
      this.source += `    ; __line = ${this.currentLine}\n`;
    }
  },

  handleMode: function (line) {
    if (this.mode !== Template.modes.COMMENT) {
      line = line.lastIndexOf('//') > line.lastIndexOf('\n') ? line + '\n' : line;
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
      case Template.modes.LITERAL:
        this._addOutput(line);
        break;
    }
  },

  _addOutput: function (line) {
    if (this.truncate) {
      line = line.replace(/^(?:\r\n|\r|\n)/, '');
      this.truncate = false;
    }
    if (!line) return;

    line = line.replace(/\\/g, '\\\\')
               .replace(/\n/g, '\\n')
               .replace(/\r/g, '\\r')
               .replace(/"/g, '\\"');
    this.source += `    ; __append("${line}")\n`;
  },

  getDestructuredLocals: function () {
    return this.opts.destructuredLocals.reduce((acc, name, i) => (
      acc + `${i === 0 ? '  var __locals = (' + this.opts.localsName + ' || {}),\n' : ','}\n  ${name} = __locals.${name}${i === this.opts.destructuredLocals.length - 1 ? ';\n' : ''}`
    ), '');
  },

  getDebugSource: function () {
    return `
      var __line = 1;
      var __lines = ${JSON.stringify(this.templateText)};
      var __filename = ${this.opts.filename ? JSON.stringify(this.opts.filename) : 'undefined'};
      try {
        ${this.source}
      } catch (e) {
        rethrow(e, __lines, __filename, __line, escapeFn);
      }
    `;
  },

  getSyntaxErrorMessage: function () {
    return ` in ${this.opts.filename || 'ejs'} while compiling ejs\n\nIf the above error is not helpful, you may want to try EJS-Lint:\nhttps://github.com/RyanZim/EJS-Lint${!this.opts.async ? '\nOr, if you meant to create an async function, pass `async: true` as an option.' : ''}`;
  },

  getConstructor: function (isAsync) {
    if (isAsync) {
      try {
        return (new Function('return (async function(){}).constructor;'))();
      } catch (e) {
        if (e instanceof SyntaxError) {
          throw new Error('This environment does not support async/await');
        }
        throw e;
      }
    }
    return Function;
  },

  getExecutableFunction: function (fn) {
    return data => {
      const include = (path, includeData) => {
        const d = utils.shallowCopy({}, data);
        if (includeData) {
          d = utils.shallowCopy(d, includeData);
        }
        return includeFile(path, this.opts)(d);
      };
      return fn.call(this.opts.context, data || {}, utils.escapeXML, include, rethrow);
    };
  }
};

exports.escapeXML = utils.escapeXML;
exports.__express = exports.renderFile;
exports.VERSION = _VERSION_STRING;
exports.name = _NAME;

if (typeof window !== 'undefined') {
  window.ejs = exports;
}
