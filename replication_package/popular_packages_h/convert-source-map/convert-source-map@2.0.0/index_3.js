'use strict';

const createCommentRegex = () => /^\s*?\/[\/\*][@#]\s+?sourceMappingURL=data:(((?:application|text)\/json)(?:;charset=([^;,]+?)?)?)?(?:;(base64))?,(.*?)$/mg;
const createMapFileCommentRegex = () => /(?:\/\/[@#][ \t]+?sourceMappingURL=([^\s'"`]+?)[ \t]*?$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*?(?:\*\/){1}[ \t]*?$)/mg;

exports.commentRegex = { get: createCommentRegex };
exports.mapFileCommentRegex = { get: createMapFileCommentRegex };

let decodeBase64 = (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') ? decodeBase64WithBufferFrom
                   : (typeof Buffer !== 'undefined') ? decodeBase64WithNewBuffer 
                   : decodeBase64WithAtob;

function decodeBase64WithBufferFrom(base64) {
  return Buffer.from(base64, 'base64').toString();
}

function decodeBase64WithNewBuffer(base64) {
  if (typeof base64 === 'number') throw new TypeError('The value to decode must not be of type number.');
  return new Buffer(base64, 'base64').toString();
}

function decodeBase64WithAtob(base64) {
  return decodeURIComponent(escape(atob(base64)));
}

function stripComment(sm) {
  return sm.split(',').pop();
}

function readFromFileMap(sm, read) {
  const match = exports.mapFileCommentRegex.exec(sm);
  const filename = match[1] || match[2];
  try {
    const sourcemap = read(filename);
    if (sourcemap && typeof sourcemap.catch === 'function') return sourcemap.catch(throwError);
    return sourcemap;
  } catch (error) {
    throwError(error);
  }

  function throwError(e) {
    throw new Error(`An error occurred while trying to read the map file at ${filename}\n${e.stack}`);
  }
}

function Converter(sm, opts = {}) {
  if (opts.hasComment) sm = stripComment(sm);
  if (opts.encoding === 'base64') sm = decodeBase64(sm);
  else if (opts.encoding === 'uri') sm = decodeURIComponent(sm);
  if (opts.isJSON || opts.encoding) sm = JSON.parse(sm);
  this.sourcemap = sm;
}

Converter.prototype.toJSON = function(space) {
  return JSON.stringify(this.sourcemap, null, space);
};

Converter.prototype.toBase64 = (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') ? encodeBase64WithBufferFrom
                           : (typeof Buffer !== 'undefined') ? encodeBase64WithNewBuffer
                           : encodeBase64WithBtoa;

function encodeBase64WithBufferFrom() {
  const json = this.toJSON();
  return Buffer.from(json, 'utf8').toString('base64');
}

function encodeBase64WithNewBuffer() {
  const json = this.toJSON();
  if (typeof json === 'number') throw new TypeError('The json to encode must not be of type number.');
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
  const encoding = (options && options.encoding === 'uri') ? '' : ';base64';
  const content = (encoding === '') ? this.toURI() : this.toBase64();
  
  const data = `sourceMappingURL=data:application/json;charset=utf-8${encoding},${content}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
};

Converter.prototype.toObject = function() {
  return JSON.parse(this.toJSON());
};

Converter.prototype.addProperty = function(key, value) {
  if (this.sourcemap.hasOwnProperty(key)) throw new Error(`property "${key}" already exists on the sourcemap, use set property instead`);
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
  const cleanedComment = comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, '');
  const match = exports.commentRegex.exec(cleanedComment);
  const encoding = (match && match[4]) || 'uri';
  return new Converter(cleanedComment, { encoding: encoding, hasComment: true });
};

function makeConverter(sm) {
  return new Converter(sm, { isJSON: true });
}

exports.fromMapFileComment = function(comment, read) {
  if (typeof read === 'string') throw new Error(
    'String directory paths are no longer supported with `fromMapFileComment`\n' +
    'Please review the Upgrading documentation at https://github.com/thlorenz/convert-source-map#upgrading'
  );

  const sourcemap = readFromFileMap(comment, read);
  return (sourcemap && typeof sourcemap.then === 'function') ? sourcemap.then(makeConverter) : makeConverter(sourcemap);
};

exports.fromSource = function(content) {
  const match = content.match(exports.commentRegex);
  return match ? exports.fromComment(match.pop()) : null;
};

exports.fromMapFileSource = function(content, read) {
  if (typeof read === 'string') throw new Error(
    'String directory paths are no longer supported with `fromMapFileSource`\n' +
    'Please review the Upgrading documentation at https://github.com/thlorenz/convert-source-map#upgrading'
  );

  const match = content.match(exports.mapFileCommentRegex);
  return match ? exports.fromMapFileComment(match.pop(), read) : null;
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
