'use strict';
const fs = require('fs');
const path = require('path');
const SafeBuffer = require('safe-buffer');

exports.commentRegex = /^\s*\/(?:\/|\*)[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(?:.*)$/mg;

exports.mapFileCommentRegex = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"`]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/){1}[ \t]*$)/mg;

const decodeBase64 = base64 => SafeBuffer.Buffer.from(base64, 'base64').toString();

const stripComment = sm => sm.split(',').pop();

const readFromFileMap = (sm, dir) => {
  const r = exports.mapFileCommentRegex.exec(sm);
  const filename = r[1] || r[2];
  const filepath = path.resolve(dir, filename);

  try {
    return fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    throw new Error(`An error occurred while trying to read the map file at ${filepath}\n${e}`);
  }
};

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

exports.fromObject = obj => new Converter(obj);

exports.fromJSON = json => new Converter(json, { isJSON: true });

exports.fromBase64 = base64 => new Converter(base64, { isEncoded: true });

exports.fromComment = comment => {
  comment = comment
    .replace(/^\/\*/g, '//')
    .replace(/\*\/$/g, '');
  return new Converter(comment, { isEncoded: true, hasComment: true });
};

exports.fromMapFileComment = (comment, dir) => new Converter(comment, { commentFileDir: dir, isFileComment: true, isJSON: true });

exports.fromSource = content => {
  const m = content.match(exports.commentRegex);
  return m ? exports.fromComment(m.pop()) : null;
};

exports.fromMapFileSource = (content, dir) => {
  const m = content.match(exports.mapFileCommentRegex);
  return m ? exports.fromMapFileComment(m.pop(), dir) : null;
};

exports.removeComments = src => src.replace(exports.commentRegex, '');

exports.removeMapFileComments = src => src.replace(exports.mapFileCommentRegex, '');

exports.generateMapFileComment = (file, options) => {
  const data = `sourceMappingURL=${file}`;
  return options && options.multiline ? `/*# ${data} */` : `//# ${data}`;
};
