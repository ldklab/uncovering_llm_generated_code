'use strict';

const commentRegex = /^\s*?\/[\/\*][@#]\s+?sourceMappingURL=data:(((?:application|text)\/json)(?:;charset=([^;,]+?)?)?)?(?:;(base64))?,(.*?)$/mg;
const mapFileCommentRegex = /(?:\/\/[@#][ \t]+?sourceMappingURL=([^\s'"`]+?)[ \t]*?$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*?(?:\*\/){1}[ \t]*?$)/mg;

exports.commentRegex = commentRegex;
exports.mapFileCommentRegex = mapFileCommentRegex;

let decodeBase64;
if (typeof Buffer !== 'undefined') {
  decodeBase64 = Buffer.from ? decodeBase64WithBufferFrom : decodeBase64WithNewBuffer;
} else {
  decodeBase64 = decodeBase64WithAtob;
}

function decodeBase64WithBufferFrom(base64) {
  return Buffer.from(base64, 'base64').toString();
}

function decodeBase64WithNewBuffer(base64) {
  if (typeof base64 === 'number') {
    throw new TypeError('The value to decode must not be of type number.');
  }
  return new Buffer(base64, 'base64').toString();
}

function decodeBase64WithAtob(base64) {
  return decodeURIComponent(escape(atob(base64)));
}

function stripComment(sm) {
  return sm.split(',').pop();
}

function readFromFileMap(sm, read) {
  const r = mapFileCommentRegex.exec(sm);
  const filename = r ? (r[1] || r[2]) : null;

  try {
    const mapData = read(filename);
    return mapData != null && typeof mapData.catch === 'function' 
        ? mapData.catch(throwError) 
        : mapData;
  } catch (e) {
    throwError(e);
  }

  function throwError(e) {
    throw new Error(`An error occurred while trying to read the map file at ${filename}\n${e.stack}`);
  }
}

function Converter(sm, opts = {}) {
  if (opts.hasComment) sm = stripComment(sm);

  if (opts.encoding === 'base64') {
    sm = decodeBase64(sm);
  } else if (opts.encoding === 'uri') {
    sm = decodeURIComponent(sm);
  }

  if (opts.isJSON || opts.encoding) {
    sm = JSON.parse(sm);
  }

  this.sourcemap = sm;
}

Converter.prototype.toJSON = function (space) {
  return JSON.stringify(this.sourcemap, null, space);
};

let encodeBase64;
if (typeof Buffer !== 'undefined') {
  encodeBase64 = Buffer.from ? encodeBase64WithBufferFrom : encodeBase64WithNewBuffer;
} else {
  encodeBase64 = encodeBase64WithBtoa;
}

function encodeBase64WithBufferFrom() {
  const json = this.toJSON();
  return Buffer.from(json, 'utf8').toString('base64');
}

function encodeBase64WithNewBuffer() {
  const json = this.toJSON();
  if (typeof json === 'number') {
    throw new TypeError('The JSON to encode must not be of type number.');
  }
  return new Buffer(json, 'utf8').toString('base64');
}

function encodeBase64WithBtoa() {
  const json = this.toJSON();
  return btoa(unescape(encodeURIComponent(json)));
}

Converter.prototype.toURI = function () {
  const json = this.toJSON();
  return encodeURIComponent(json);
};

Converter.prototype.toComment = function (options) {
  const encoding = options && options.encoding === 'uri' ? '' : ';base64';
  const content = options && options.encoding === 'uri' ? this.toURI() : this.toBase64();
  const data = `sourceMappingURL=data:application/json;charset=utf-8${encoding},${content}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
};

Converter.prototype.toObject = function () {
  return JSON.parse(this.toJSON());
};

Converter.prototype.addProperty = function (key, value) {
  if (this.sourcemap.hasOwnProperty(key)) {
    throw new Error(`property "${key}" already exists on the sourcemap, use setProperty instead`);
  }
  return this.setProperty(key, value);
};

Converter.prototype.setProperty = function (key, value) {
  this.sourcemap[key] = value;
  return this;
};

Converter.prototype.getProperty = function (key) {
  return this.sourcemap[key];
};

exports.fromObject = obj => new Converter(obj);

exports.fromJSON = json => new Converter(json, { isJSON: true });

exports.fromURI = uri => new Converter(uri, { encoding: 'uri' });

exports.fromBase64 = base64 => new Converter(base64, { encoding: 'base64' });

exports.fromComment = comment => {
  const cleanedComment = comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, '');
  const match = commentRegex.exec(cleanedComment);
  const encoding = match && match[4] || 'uri';
  return new Converter(cleanedComment, { encoding, hasComment: true });
};

exports.fromMapFileComment = function (comment, read) {
  if (typeof read === 'string') {
    throw new Error(
      'String directory paths are no longer supported with `fromMapFileComment`\n' +
      'Please review the Upgrading documentation at https://github.com/thlorenz/convert-source-map#upgrading'
    );
  }

  const sm = readFromFileMap(comment, read);
  return sm != null && typeof sm.then === 'function' ? sm.then(makeConverter) : makeConverter(sm);
};

function makeConverter(sm) {
  return new Converter(sm, { isJSON: true });
}

exports.fromSource = function (content) {
  const match = content.match(commentRegex);
  return match ? exports.fromComment(match.pop()) : null;
};

exports.fromMapFileSource = function (content, read) {
  if (typeof read === 'string') {
    throw new Error(
      'String directory paths are no longer supported with `fromMapFileSource`\n' +
      'Please review the Upgrading documentation at https://github.com/thlorenz/convert-source-map#upgrading'
    );
  }
  const match = content.match(mapFileCommentRegex);
  return match ? exports.fromMapFileComment(match.pop(), read) : null;
};

exports.removeComments = src => src.replace(commentRegex, '');

exports.removeMapFileComments = src => src.replace(mapFileCommentRegex, '');

exports.generateMapFileComment = (file, options) => {
  const data = `sourceMappingURL=${file}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
};
