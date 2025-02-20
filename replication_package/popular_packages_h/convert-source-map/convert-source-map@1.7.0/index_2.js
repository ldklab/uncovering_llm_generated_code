'use strict';
const fs = require('fs');
const path = require('path');
const SafeBuffer = require('safe-buffer');

const commentRegex = /^\s*\/(?:\/|\*)[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(?:.*)$/mg;
const mapFileCommentRegex = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"`]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/){1}[ \t]*$)/mg;

function decodeBase64(base64) {
  return SafeBuffer.Buffer.from(base64, 'base64').toString();
}

function stripComment(sm) {
  return sm.split(',').pop();
}

function readFromFileMap(sm, dir) {
  const match = mapFileCommentRegex.exec(sm);
  const filename = match[1] || match[2];
  const filepath = path.resolve(dir, filename);

  try {
    return fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    throw new Error(`An error occurred while trying to read the map file at ${filepath}\n${e}`);
  }
}

class Converter {
  constructor(sm, opts = {}) {
    if (opts.isFileComment) sm = readFromFileMap(sm, opts.commentFileDir);
    if (opts.hasComment) sm = stripComment(sm);
    if (opts.isEncoded) sm = decodeBase64(sm);
    if (opts.isJSON || opts.isEncoded) sm = JSON.parse(sm);

    this.sourcemap = sm;
  }

  toJSON(space) {
    return JSON.stringify(this.sourcemap, null, space);
  }

  toBase64() {
    const json = this.toJSON();
    return SafeBuffer.Buffer.from(json, 'utf8').toString('base64');
  }

  toComment(options) {
    const base64 = this.toBase64();
    const data = `sourceMappingURL=data:application/json;charset=utf-8;base64,${base64}`;
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

function fromObject(obj) {
  return new Converter(obj);
}

function fromJSON(json) {
  return new Converter(json, { isJSON: true });
}

function fromBase64(base64) {
  return new Converter(base64, { isEncoded: true });
}

function fromComment(comment) {
  comment = comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, '');
  return new Converter(comment, { isEncoded: true, hasComment: true });
}

function fromMapFileComment(comment, dir) {
  return new Converter(comment, { commentFileDir: dir, isFileComment: true, isJSON: true });
}

function fromSource(content) {
  const match = content.match(commentRegex);
  return match ? fromComment(match.pop()) : null;
}

function fromMapFileSource(content, dir) {
  const match = content.match(mapFileCommentRegex);
  return match ? fromMapFileComment(match.pop(), dir) : null;
}

function removeComments(src) {
  return src.replace(commentRegex, '');
}

function removeMapFileComments(src) {
  return src.replace(mapFileCommentRegex, '');
}

function generateMapFileComment(file, options) {
  const data = `sourceMappingURL=${file}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
}

module.exports = {
  commentRegex,
  mapFileCommentRegex,
  Converter,
  fromObject,
  fromJSON,
  fromBase64,
  fromComment,
  fromMapFileComment,
  fromSource,
  fromMapFileSource,
  removeComments,
  removeMapFileComments,
  generateMapFileComment
};
