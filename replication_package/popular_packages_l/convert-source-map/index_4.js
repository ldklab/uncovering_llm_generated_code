const convertSourceMap = (() => {
  // Utility functions to parse base64 and URI encoded JSON strings
  function parseBase64(base64) {
    return JSON.parse(Buffer.from(base64, 'base64').toString());
  }

  function parseUri(uri) {
    return JSON.parse(decodeURIComponent(uri));
  }

  // Regular expressions to match source map comments in code
  const commentRegex = /\/\/[#@] sourceMappingURL=data:application\/json;(charset=[^;]+;)?(base64,([A-Za-z0-9+/=]+))|(utf-8,([^,]+))/;
  const mapFileCommentRegex = /\/\/[#@] sourceMappingURL=([^\s'"]+)/;
  
  // Converter class to handle the source map
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
      return 'data:application/json;charset=utf-8,' + encodeURIComponent(this.toJSON());
    }

    toBase64() {
      return Buffer.from(this.toJSON()).toString('base64');
    }

    toComment(options) {
      const encoding = options?.encoding === 'uri' ? 'utf-8' : 'base64';
      const data = encoding === 'base64' ? this.toBase64() : this.toURI().split(',')[1];
      const comment = `//# sourceMappingURL=data:application/json;charset=utf-8;${encoding},${data}`;
      return options?.multiline ? `/*${comment} */` : comment;
    }

    addProperty(key, value) {
      if (key in this.map) {
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

  // Functions to create Converter instances from various input types
  const fromObject = (obj) => new Converter(obj);
  const fromJSON = (json) => fromObject(JSON.parse(json));
  const fromURI = (uri) => fromObject(parseUri(uri));
  const fromBase64 = (base64) => fromObject(parseBase64(base64));

  function fromComment(comment) {
    const match = comment.match(commentRegex);
    if (!match) throw new Error('Invalid source map comment');
    return match[3] ? fromBase64(match[3]) : fromURI(match[5]);
  }

  function fromMapFileComment(comment, readMap) {
    const match = comment.match(mapFileCommentRegex);
    if (!match) return null;
    const filename = match[1];
    const result = readMap(filename);
    if (result instanceof Promise) {
      return result.then(map => fromJSON(map.toString()));
    }
    return fromJSON(result.toString());
  }

  function fromSource(source) {
    const match = source.match(commentRegex);
    return match ? fromComment(match[0]) : null;
  }

  function fromMapFileSource(source, readMap) {
    const match = source.match(mapFileCommentRegex);
    return match ? fromMapFileComment(match[0], readMap) : null;
  }

  // Functions to remove comments from source code
  const removeComments = (src) => src.replace(commentRegex, '');
  const removeMapFileComments = (src) => src.replace(mapFileCommentRegex, '');

  // Function to generate a source map file comment
  function generateMapFileComment(file, options) {
    const comment = `//# sourceMappingURL=${file}`;
    return options?.multiline ? `/*${comment} */` : comment;
  }

  return {
    fromObject,
    fromJSON,
    fromURI,
    fromBase64,
    fromComment,
    fromMapFileComment,
    fromSource,
    fromMapFileSource,
    toObject: (map) => fromObject(map).toObject(),
    toJSON: (map, space) => fromObject(map).toJSON(space),
    toURI: (map) => fromObject(map).toURI(),
    toBase64: (map) => fromObject(map).toBase64(),
    toComment: (map, options) => fromObject(map).toComment(options),
    addProperty: (map, key, value) => fromObject(map).addProperty(key, value),
    setProperty: (map, key, value) => fromObject(map).setProperty(key, value),
    getProperty: (map, key) => fromObject(map).getProperty(key),
    removeComments,
    removeMapFileComments,
    commentRegex,
    mapFileCommentRegex,
    generateMapFileComment,
  };
})();

module.exports = convertSourceMap;
