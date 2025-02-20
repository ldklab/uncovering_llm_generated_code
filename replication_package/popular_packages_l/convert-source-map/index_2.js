const convertSourceMap = (() => {

  const COMMENT_REGEX = /\/\/[#@] sourceMappingURL=data:application\/json;(charset=[^;]+;)?(base64,([A-Za-z0-9+/=]+))|(utf-8,([^,]+))/;
  const MAP_FILE_COMMENT_REGEX = /\/\/[#@] sourceMappingURL=([^\s'"]+)/;

  const parseBase64 = base64 => {
    const json = Buffer.from(base64, 'base64').toString();
    return JSON.parse(json);
  };

  const parseUri = uri => {
    const json = decodeURIComponent(uri);
    return JSON.parse(json);
  };

  class Converter {
    constructor(map) {
      this.map = map;
    }

    toObject() {
      return { ...this.map };
    }

    toJSON(space) {
      return JSON.stringify(this.map, null, space);
    }

    toURI() {
      return `data:application/json;charset=utf-8,${encodeURIComponent(this.toJSON())}`;
    }

    toBase64() {
      return Buffer.from(this.toJSON()).toString('base64');
    }

    toComment({ encoding = 'base64', multiline = false } = {}) {
      const data = encoding === 'base64' ? this.toBase64() : this.toURI().split(',')[1];
      const comment = `//# sourceMappingURL=data:application/json;charset=utf-8;${encoding},${data}`;
      return multiline ? `/*${comment} */` : comment;
    }

    addProperty(key, value) {
      if (this.map[key] !== undefined) {
        throw new Error(`Property ${key} already exists.`);
      }
      this.map[key] = value;
    }

    setProperty(key, value) {
      this.map[key] = value;
    }

    getProperty(key) {
      return this.map[key];
    }
  }

  const fromObject = obj => new Converter(obj);
  const fromJSON = json => fromObject(JSON.parse(json));
  const fromURI = uri => fromObject(parseUri(uri));
  const fromBase64 = base64 => fromObject(parseBase64(base64));

  const fromComment = comment => {
    const match = comment.match(COMMENT_REGEX);
    if (!match) throw new Error('Invalid source map comment');
    return match[3] ? fromBase64(match[3]) : fromURI(match[5]);
  };

  const fromMapFileComment = (comment, readMap) => {
    const match = comment.match(MAP_FILE_COMMENT_REGEX);
    if (!match) return null;
    const filename = match[1];
    const result = readMap(filename);
    return result instanceof Promise ? result.then(map => fromJSON(map.toString())) : fromJSON(result.toString());
  };

  const fromSource = source => {
    const match = source.match(COMMENT_REGEX);
    return match ? fromComment(match[0]) : null;
  };

  const fromMapFileSource = (source, readMap) => {
    const match = source.match(MAP_FILE_COMMENT_REGEX);
    return match ? fromMapFileComment(match[0], readMap) : null;
  };

  const removeComments = src => src.replace(COMMENT_REGEX, '');
  const removeMapFileComments = src => src.replace(MAP_FILE_COMMENT_REGEX, '');
  const generateMapFileComment = (file, { multiline = false } = {}) => multiline ? `/*//# sourceMappingURL=${file} */` : `//# sourceMappingURL=${file}`;

  return {
    fromObject,
    fromJSON,
    fromURI,
    fromBase64,
    fromComment,
    fromMapFileComment,
    fromSource,
    fromMapFileSource,
    toObject: map => fromObject(map).toObject(),
    toJSON: (map, space) => fromObject(map).toJSON(space),
    toURI: map => fromObject(map).toURI(),
    toBase64: map => fromObject(map).toBase64(),
    toComment: (map, options) => fromObject(map).toComment(options),
    addProperty: (map, key, value) => fromObject(map).addProperty(key, value),
    setProperty: (map, key, value) => fromObject(map).setProperty(key, value),
    getProperty: (map, key) => fromObject(map).getProperty(key),
    removeComments,
    removeMapFileComments,
    commentRegex: () => COMMENT_REGEX,
    mapFileCommentRegex: () => MAP_FILE_COMMENT_REGEX,
    generateMapFileComment,
  };

})();

module.exports = convertSourceMap;
