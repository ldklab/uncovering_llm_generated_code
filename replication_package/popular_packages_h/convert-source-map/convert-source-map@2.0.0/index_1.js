'use strict';

const COMMENT_REGEX = /^\s*?\/[\/\*][@#]\s+?sourceMappingURL=data:(((?:application|text)\/json)(?:;charset=([^;,]+?)?)?)?(?:;(base64))?,(.*?)$/mg;
const MAP_FILE_COMMENT_REGEX = /(?:\/\/[@#][ \t]+?sourceMappingURL=([^\s'"`]+?)[ \t]*?$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*?(?:\*\/){1}[ \t]*?$)/mg;

exports.commentRegex = COMMENT_REGEX;
exports.mapFileCommentRegex = MAP_FILE_COMMENT_REGEX;

// Decode base64 string based on the environment
const decodeBase64 = (() => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from ? base64 => Buffer.from(base64, 'base64').toString() : base64 => new Buffer(base64, 'base64').toString();
  }
  return base64 => decodeURIComponent(escape(atob(base64)));
})();

function stripComment(sourceMap) {
  return sourceMap.split(',').pop();
}

function readFromFileMap(comment, read) {
  const match = MAP_FILE_COMMENT_REGEX.exec(comment);
  const filename = match[1] || match[2];
  try {
    const sm = read(filename);
    if (sm && typeof sm.then === 'function') return sm.catch(errorHandler);
    return sm;
  } catch (error) {
    errorHandler(error);
  }

  function errorHandler(error) {
    throw new Error(`An error occurred while trying to read the map file at ${filename}\n${error.stack}`);
  }
}

class Converter {
  constructor(sourceMap, options = {}) {
    if (options.hasComment) sourceMap = stripComment(sourceMap);
    sourceMap = options.encoding === 'base64' ? decodeBase64(sourceMap) : options.encoding === 'uri' ? decodeURIComponent(sourceMap) : sourceMap;
    this.sourcemap = options.isJSON || options.encoding ? JSON.parse(sourceMap) : sourceMap;
  }

  toJSON(space) {
    return JSON.stringify(this.sourcemap, null, space);
  }

  toBase64() {
    const json = this.toJSON();
    return Buffer.from ? Buffer.from(json, 'utf8').toString('base64') : new Buffer(json, 'utf8').toString('base64');
  }

  toURI() {
    return encodeURIComponent(this.toJSON());
  }

  toComment(options) {
    const encoding = options && options.encoding === 'uri' ? '' : ';base64';
    const content = options && options.encoding === 'uri' ? this.toURI() : this.toBase64();
    const data = `sourceMappingURL=data:application/json;charset=utf-8${encoding},${content}`;
    return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
  }

  toObject() {
    return JSON.parse(this.toJSON());
  }

  addProperty(key, value) {
    if (this.sourcemap.hasOwnProperty(key)) throw new Error(`property "${key}" already exists on the sourcemap, use set property instead`);
    return this.setProperty(key, value);
  }

  setProperty(key, value) {
    this.sourcemap[key] = value;
    return this;
  }

  getProperty(key) {
    return this.sourcemap[key];
  }
}

exports.fromObject = obj => new Converter(obj);
exports.fromJSON = json => new Converter(json, { isJSON: true });
exports.fromURI = uri => new Converter(uri, { encoding: 'uri' });
exports.fromBase64 = base64 => new Converter(base64, { encoding: 'base64' });
exports.fromComment = comment => {
  comment = comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, '');
  const match = COMMENT_REGEX.exec(comment);
  const encoding = match && match[4] || 'uri';
  return new Converter(comment, { encoding, hasComment: true });
};

function makeConverter(sourceMap) {
  return new Converter(sourceMap, { isJSON: true });
}

exports.fromMapFileComment = (comment, read) => {
  if (typeof read === 'string') throw new Error('String directory paths are no longer supported with `fromMapFileComment`\nVisit https://github.com/thlorenz/convert-source-map#upgrading');
  
  const sm = readFromFileMap(comment, read);
  return sm && typeof sm.then === 'function' ? sm.then(makeConverter) : makeConverter(sm);
};

exports.fromSource = content => {
  const match = content.match(COMMENT_REGEX);
  return match ? exports.fromComment(match.pop()) : null;
};

exports.fromMapFileSource = (content, read) => {
  if (typeof read === 'string') throw new Error('String directory paths are no longer supported with `fromMapFileSource`\nVisit https://github.com/thlorenz/convert-source-map#upgrading');
  
  const match = content.match(MAP_FILE_COMMENT_REGEX);
  return match ? exports.fromMapFileComment(match.pop(), read) : null;
};

exports.removeComments = src => src.replace(COMMENT_REGEX, '');
exports.removeMapFileComments = src => src.replace(MAP_FILE_COMMENT_REGEX, '');

exports.generateMapFileComment = (file, options) => {
  const data = `sourceMappingURL=${file}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
};
