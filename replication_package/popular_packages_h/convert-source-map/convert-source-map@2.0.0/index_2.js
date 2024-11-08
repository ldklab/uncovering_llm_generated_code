'use strict';

Object.defineProperty(exports, 'commentRegex', {
  get() {
    return /^\s*?\/[\/\*][@#]\s+?sourceMappingURL=data:(((?:application|text)\/json)(?:;charset=([^;,]+?)?)?)?(?:;(base64))?,(.*?)$/mg;
  }
});

Object.defineProperty(exports, 'mapFileCommentRegex', {
  get() {
    return /(?:\/\/[@#][ \t]+?sourceMappingURL=([^\s'"`]+?)[ \t]*?$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*?(?:\*\/){1}[ \t]*?$)/mg;
  }
});

let decodeBase64;
if (typeof Buffer !== 'undefined') {
  decodeBase64 = typeof Buffer.from === 'function' ? decodeBase64WithBufferFrom : decodeBase64WithNewBuffer;
} else {
  decodeBase64 = decodeBase64WithAtob;
}

function decodeBase64WithBufferFrom(base64) {
  return Buffer.from(base64, 'base64').toString();
}

function decodeBase64WithNewBuffer(base64) {
  if (typeof base64 === 'number') throw new TypeError('Value must not be of type number.');
  return new Buffer(base64, 'base64').toString();
}

function decodeBase64WithAtob(base64) {
  return decodeURIComponent(escape(atob(base64)));
}

function stripComment(sm) {
  return sm.split(',').pop();
}

function readFromFileMap(sm, read) {
  const r = exports.mapFileCommentRegex.exec(sm);
  const filename = r[1] || r[2];
  try {
    const sm = read(filename);
    return sm && typeof sm.catch === 'function' ? sm.catch(throwError) : sm;
  } catch (e) {
    throwError(e);
  }

  function throwError(e) {
    throw new Error(`Error reading map file at ${filename}\n${e.stack}`);
  }
}

function Converter(sm, opts = {}) {
  if (opts.hasComment) {
    sm = stripComment(sm);
  }
  if (opts.encoding === 'base64') {
    sm = decodeBase64(sm);
  } else if (opts.encoding === 'uri') {
    sm = decodeURIComponent(sm);
  }
  this.sourcemap = opts.isJSON || opts.encoding ? JSON.parse(sm) : sm;
}

Converter.prototype.toJSON = function(space) {
  return JSON.stringify(this.sourcemap, null, space);
};

if (typeof Buffer !== 'undefined') {
  Converter.prototype.toBase64 = typeof Buffer.from === 'function' ? encodeBase64WithBufferFrom : encodeBase64WithNewBuffer;
} else {
  Converter.prototype.toBase64 = encodeBase64WithBtoa;
}

function encodeBase64WithBufferFrom() {
  const json = this.toJSON();
  return Buffer.from(json, 'utf8').toString('base64');
}

function encodeBase64WithNewBuffer() {
  const json = this.toJSON();
  if (typeof json === 'number') throw new TypeError('Value must not be of type number.');
  return new Buffer(json, 'utf8').toString('base64');
}

function encodeBase64WithBtoa() {
  const json = this.toJSON();
  return btoa(unescape(encodeURIComponent(json)));
}

Converter.prototype.toURI = function() {
  return encodeURIComponent(this.toJSON());
};

Converter.prototype.toComment = function(options) {
  const encoding = options && options.encoding === 'uri' ? '' : ';base64';
  const content = encoding ? this.toBase64() : this.toURI();
  const data = `sourceMappingURL=data:application/json;charset=utf-8${encoding},${content}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
};

Converter.prototype.toObject = function() {
  return JSON.parse(this.toJSON());
};

Converter.prototype.addProperty = function(key, value) {
  if (this.sourcemap.hasOwnProperty(key)) throw new Error(`Property "${key}" exists, use setProperty instead.`);
  return this.setProperty(key, value);
};

Converter.prototype.setProperty = function(key, value) {
  this.sourcemap[key] = value;
  return this;
};

Converter.prototype.getProperty = function(key) {
  return this.sourcemap[key];
};

exports.fromObject = function(obj) {
  return new Converter(obj);
};

exports.fromJSON = function(json) {
  return new Converter(json, { isJSON: true });
};

exports.fromURI = function(uri) {
  return new Converter(uri, { encoding: 'uri' });
};

exports.fromBase64 = function(base64) {
  return new Converter(base64, { encoding: 'base64' });
};

exports.fromComment = function(comment) {
  comment = comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, '');
  const m = exports.commentRegex.exec(comment);
  const encoding = m ? m[4] || 'uri' : 'uri';
  return new Converter(comment, { encoding, hasComment: true });
};

function makeConverter(sm) {
  return new Converter(sm, { isJSON: true });
}

exports.fromMapFileComment = function(comment, read) {
  if (typeof read === 'string') throw new Error('String directory paths unsupported. See upgrade guide.');
  const sm = readFromFileMap(comment, read);
  return sm && typeof sm.then === 'function' ? sm.then(makeConverter) : makeConverter(sm);
};

exports.fromSource = function(content) {
  const m = content.match(exports.commentRegex);
  return m ? exports.fromComment(m.pop()) : null;
};

exports.fromMapFileSource = function(content, read) {
  if (typeof read === 'string') throw new Error('String paths unsupported. See upgrade guide.');
  const m = content.match(exports.mapFileCommentRegex);
  return m ? exports.fromMapFileComment(m.pop(), read) : null;
};

exports.removeComments = function(src) {
  return src.replace(exports.commentRegex, '');
};

exports.removeMapFileComments = function(src) {
  return src.replace(exports.mapFileCommentRegex, '');
};

exports.generateMapFileComment = function(file, options) {
  const data = `sourceMappingURL=${file}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
};
