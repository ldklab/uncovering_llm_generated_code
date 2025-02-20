const convertSourceMap = (() => {
  // Parse base64-encoded JSON
  function parseBase64(encoded) {
    return JSON.parse(Buffer.from(encoded, 'base64').toString());
  }

  // Parse URI-encoded JSON
  function parseUri(encoded) {
    return JSON.parse(decodeURIComponent(encoded));
  }

  // Regular expressions for source map comments
  const commentRegex = /\/\/[@#] sourceMappingURL=data:application\/json;(charset=[^;]+;)?(base64,([A-Za-z0-9+/=]+))|(utf-8,([^,]+))/;
  const mapFileCommentRegex = /\/\/[@#] sourceMappingURL=([^\s'"]+)/;

  // Converter class to handle source map data
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
    toComment(options = {}) {
      const format = options.encoding === 'uri' ? 'utf-8' : 'base64';
      const data = format === 'base64' ? this.toBase64() : this.toURI().split(',')[1];
      const comment = `//# sourceMappingURL=data:application/json;charset=utf-8;${format},${data}`;
      return options.multiline ? `/*${comment} */` : comment;
    }
    addProperty(key, value) {
      if (this.map[key] !== undefined) {
        throw Error(`Property ${key} already exists.`);
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

  // Factory methods to create a Converter instance from different formats
  const fromObject = obj => new Converter(obj);
  const fromJSON = json => new Converter(JSON.parse(json));
  const fromURI = uri => new Converter(parseUri(uri));
  const fromBase64 = base64 => new Converter(parseBase64(base64));
  
  // Create Converter from source map comments
  const fromComment = comment => {
    const match = comment.match(commentRegex);
    if (!match) throw Error('Invalid source map comment');
    return match[3] ? fromBase64(match[3]) : fromURI(match[5]);
  };

  const fromMapFileComment = (comment, readMap) => {
    const match = comment.match(mapFileCommentRegex);
    if (!match) return null;
    const fileData = readMap(match[1]);
    const mapData = fileData instanceof Promise ? fileData.then(data => data.toString()) : fileData.toString();
    return fromJSON(mapData);
  };

  // Remove source map comments from source code
  const removeComments = src => src.replace(commentRegex, '');
  const removeMapFileComments = src => src.replace(mapFileCommentRegex, '');

  // Generate map file comment
  const generateMapFileComment = (file, options = {}) => {
    const comment = `//# sourceMappingURL=${file}`;
    return options.multiline ? `/*${comment} */` : comment;
  };

  return {
    fromObject,
    fromJSON,
    fromURI,
    fromBase64,
    fromComment,
    fromMapFileComment,
    removeComments,
    removeMapFileComments,
    commentRegex,
    mapFileCommentRegex,
    generateMapFileComment,
    toObject: map => fromObject(map).toObject(),
    toJSON: (map, space) => fromObject(map).toJSON(space),
    toURI: map => fromObject(map).toURI(),
    toBase64: map => fromObject(map).toBase64(),
    toComment: (map, options) => fromObject(map).toComment(options),
    addProperty: (map, key, value) => fromObject(map).addProperty(key, value),
    setProperty: (map, key, value) => fromObject(map).setProperty(key, value),
    getProperty: (map, key) => fromObject(map).getProperty(key),
  };
})();

module.exports = convertSourceMap;
