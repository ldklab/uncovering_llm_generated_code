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
const _JS_IDENTIFIER = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

exports.cache = utils.cache;
exports.fileLoader = fs.readFileSync;
exports.localsName = _DEFAULT_LOCALS_NAME;
exports.promiseImpl = Promise;
exports.VERSION = _VERSION_STRING;
exports.name = _NAME;

exports.resolveInclude = function (name, filename, isDir) {
  let includePath = path.resolve(isDir ? filename : path.dirname(filename), name);
  if (!path.extname(name)) includePath += '.ejs';
  return includePath;
};

function resolvePaths(name, paths) {
  let filePath;
  paths.some(v => {
    filePath = exports.resolveInclude(name, v, true);
    return fs.existsSync(filePath);
  });
  return filePath;
}

function getIncludePath(filePath, options) {
  let includePath;
  const absPathMatch = /^[A-Za-z]+:\\|^\//.exec(filePath);
  if (absPathMatch) {
    filePath = filePath.replace(/^\/*/, '');
    includePath = Array.isArray(options.root) ? resolvePaths(filePath, options.root) : exports.resolveInclude(filePath, options.root || '/', true);
  } else {
    if (options.filename) {
      includePath = exports.resolveInclude(filePath, options.filename);
      if (fs.existsSync(includePath)) return includePath;
    }
    if (Array.isArray(options.views)) {
      includePath = resolvePaths(filePath, options.views);
    }
  }
  if (!includePath) throw new Error(`Could not find the include file "${options.escapeFunction(filePath)}"`);
  return includePath;
}

function handleCache(options, template) {
  let func;
  const filename = options.filename;
  if (options.cache) {
    if (!filename) throw new Error('cache option requires a filename');
    func = exports.cache.get(filename);
    if (func) return func;
    if (!template) template = fs.readFileSync(filename).toString().replace(_BOM, '');
  } else if (!template) {
    if (!filename) throw new Error('Internal EJS error: no file name or template provided');
    template = fs.readFileSync(filename).toString().replace(_BOM, '');
  }
  func = exports.compile(template, options);
  options.cache && exports.cache.set(filename, func);
  return func;
}

function tryHandleCache(options, data, cb) {
  if (cb) {
    try {
      const result = handleCache(options)(data);
      cb(null, result);
    } catch (err) {
      cb(err);
    }
  } else {
    return new exports.promiseImpl((resolve, reject) => {
      try {
        resolve(handleCache(options)(data));
      } catch (err) {
        reject(err);
      }
    });
  }
}

exports.compile = function compile(template, opts) {
  const templ = new Template(template, opts);
  return templ.compile();
};

exports.render = function (template, data = {}, options = {}) {
  if (arguments.length == 2) utils.shallowCopyFromList(options, data, _OPTS_PASSABLE_WITH_DATA);
  return handleCache(options, template)(data);
};

exports.renderFile = function () {
  let args = [].slice.call(arguments);
  const filename = args.shift();
  const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  const opts = { filename };
  let data;

  if (args.length) {
    data = args.shift();
    if (args.length) utils.shallowCopy(opts, args.pop());
    else {
      if (data.settings) {
        opts.views = data.settings.views;
        opts.cache = data.settings['view cache'];
        const viewOpts = data.settings['view options'];
        if (viewOpts) utils.shallowCopy(opts, viewOpts);
      }
      utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
    }
  } else {
    data = utils.createNullProtoObjWherePossible();
  }

  return tryHandleCache(opts, data, cb);
};

exports.clearCache = function () {
  exports.cache.reset();
};

function Template(text, opts = {}) {
  this.templateText = text;
  this.mode = null;
  this.truncate = false;
  this.currentLine = 1;
  this.source = '';
  this.opts = Object.assign(utils.createNullProtoObjWherePossible(), {
    client: false,
    escapeFunction: utils.escapeXML,
    compileDebug: true,
    debug: false,
    openDelimiter: _DEFAULT_OPEN_DELIMITER,
    closeDelimiter: _DEFAULT_CLOSE_DELIMITER,
    delimiter: _DEFAULT_DELIMITER,
    strict: false,
    cache: false,
    legacyInclude: true,
    _with: true,
    ...opts,
  });
  this.regex = this.createRegex();
}

Template.modes = {
  EVAL: 'eval',
  ESCAPED: 'escaped',
  RAW: 'raw',
  COMMENT: 'comment',
  LITERAL: 'literal'
};

Template.prototype.createRegex = function () {
  let str = _REGEX_STRING.replace(/%/g, utils.escapeRegExpChars(this.opts.delimiter))
    .replace(/</g, utils.escapeRegExpChars(this.opts.openDelimiter))
    .replace(/>/g, utils.escapeRegExpChars(this.opts.closeDelimiter));
  return new RegExp(str);
};

Template.prototype.compile = function () {
  if (!this.source) this.generateSource();
  let src = this.opts.compileDebug ? `
    var __line = 1,
        __lines = ${JSON.stringify(this.templateText)},
        __filename = ${this.opts.filename ? JSON.stringify(this.opts.filename) : 'undefined'};

    try {
      ${this.source}
    } catch (e) {
      rethrow(e, __lines, __filename, __line, escapeFn);
    }
  ` : this.source;

  if (this.opts.client) {
    src = `escapeFn = escapeFn || ${this.opts.escapeFunction.toString()};\n${src}`;
    if (this.opts.compileDebug) src = `rethrow = rethrow || ${rethrow.toString()};\n${src}`;
  }

  if (this.opts.strict) src = `"use strict";\n${src}`;
  if (this.opts.debug) console.log(src);

  const fn = (new Function(this.opts.localsName + ', escapeFn, include, rethrow', src));
  return !this.opts.client ? (data) => fn.apply(this.opts.context, [data || {}, this.opts.escapeFunction, includeFile, rethrow]) : fn;
};

Template.prototype.generateSource = function () {
  this.templateText = this.opts.rmWhitespace
    ? this.templateText.replace(/^\s+|\s+$/gm, '').replace(/[\r\n]+/g, '\n')
    : this.templateText;

  this.templateText = this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');
  this.parseTemplateText().forEach(line => this.scanLine(line));
};

Template.prototype.parseTemplateText = function () {
  const arr = [];
  let result;
  let str = this.templateText;
  const pat = this.regex;
  
  while ((result = pat.exec(str))) {
    const firstPos = result.index;
    if (firstPos !== 0) {
      arr.push(str.substring(0, firstPos));
      str = str.slice(firstPos);
    }
    arr.push(result[0]);
    str = str.slice(result[0].length);
  }
  if (str) arr.push(str);
  return arr;
};

Template.prototype.scanLine = function (line) {
  switch (line) {
    case `<${this.opts.delimiter}`:
    case `<${this.opts.delimiter}_`:
      this.mode = Template.modes.EVAL;
      break;
    case `<${this.opts.delimiter}=`:
      this.mode = Template.modes.ESCAPED;
      break;
    case `<${this.opts.delimiter}-`:
      this.mode = Template.modes.RAW;
      break;
    case `<${this.opts.delimiter}#`:
      this.mode = Template.modes.COMMENT;
      break;
    case `<${this.opts.delimiter}${this.opts.delimiter}`:
      this.mode = Template.modes.LITERAL;
      this.source += `    ; __append(\`${line.replace(`<${this.opts.delimiter}${this.opts.delimiter}`, `<${this.opts.delimiter}`)}\`);\n`;
      break;
    default:
      if (this.mode) {
        switch (this.mode) {
          case Template.modes.EVAL:
            this.source += `    ; ${line}\n`;
            break;
          case Template.modes.ESCAPED:
            this.source += `    ; __append(escapeFn(${stripSemi(line)}));\n`;
            break;
          case Template.modes.RAW:
            this.source += `    ; __append(${stripSemi(line)});\n`;
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

  if (this.opts.compileDebug && line.includes('\n')) {
    this.currentLine += (line.match(/\n/g) || []).length;
    this.source += `    ; __line = ${this.currentLine};\n`;
  }
};

Template.prototype._addOutput = function (line) {
  if (this.truncate) {
    line = line.replace(/^(?:\r\n|\r|\n)/, '');
    this.truncate = false;
  }
  if (line) {
    line = line.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"');
    this.source += `    ; __append("${line}");\n`;
  }
};

function stripSemi(str) {
  return str.replace(/;(\s*$)/, '$1');
}

function includeFile(path, opts) {
  opts.filename = getIncludePath(path, opts);
  return handleCache(opts);
}

function rethrow(err, str, flnm, lineno, esc) {
  const lines = str.split('\n');
  const start = Math.max(lineno - 3, 0);
  const end = Math.min(lines.length, lineno + 3);
  const context = lines.slice(start, end).map((line, i) => 
    `${(i + start + 1 === lineno) ? ' >> ' : '    '}${i + start + 1}| ${line}`
  ).join('\n');

  err.path = esc(flnm);
  err.message = `${err.path || 'ejs'}:${lineno}\n${context}\n\n${err.message}`;
  throw err;
}

exports.__express = exports.renderFile;
