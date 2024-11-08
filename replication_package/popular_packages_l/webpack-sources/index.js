class Source {
  constructor() {
    if (new.target === Source) {
      throw new TypeError("Cannot construct Source instances directly");
    }
  }

  source() {
    throw new Error("Method 'source()' must be implemented.");
  }

  buffer() {
    const src = this.source();
    return Buffer.isBuffer(src) ? src : Buffer.from(src, 'utf-8');
  }

  size() {
    return this.buffer().length;
  }

  map(options = { columns: true }) {
    return null; // Default implementation
  }

  sourceAndMap(options = { columns: true }) {
    return {
      source: this.source(),
      map: this.map(options),
    };
  }

  updateHash(hash) {
    hash.update(this.source());
  }
}

class RawSource extends Source {
  constructor(sourceCode) {
    super();
    this.sourceCode = sourceCode;
  }

  source() {
    return this.sourceCode;
  }
}

class OriginalSource extends Source {
  constructor(sourceCode, name) {
    super();
    this.sourceCode = sourceCode;
    this.name = name;
  }

  source() {
    return this.sourceCode;
  }

  map(options = { columns: true }) {
    // Attempt to create a map; for simplicity, return an empty map
    return { version: 3, sources: [this.name], names: [], mappings: '' };
  }
}

class SourceMapSource extends Source {
  constructor(sourceCode, name, sourceMap, originalSource = null, innerSourceMap = null, removeOriginalSource = false) {
    super();
    this.sourceCode = sourceCode;
    this.name = name;
    this.sourceMap = typeof sourceMap === 'string' ? JSON.parse(sourceMap) : sourceMap;
    this.originalSource = originalSource;
    this.innerSourceMap = innerSourceMap;
    this.removeOriginalSource = removeOriginalSource;
  }

  source() {
    return this.sourceCode;
  }

  map(options = { columns: true }) {
    // Basic handling of source maps for demonstration
    return this.sourceMap;
  }
}

class CachedSource extends Source {
  constructor(source, cachedData = null) {
    super();
    this.cachedData = cachedData || {};
    this.source = typeof source === 'function' ? source() : source;
  }

  source() {
    if (!this.cachedData.source) this.cachedData.source = this.source.source();
    return this.cachedData.source;
  }

  map(options = { columns: true }) {
    if (!this.cachedData.map) this.cachedData.map = this.source.map(options);
    return this.cachedData.map;
  }

  buffer() {
    if (!this.cachedData.buffer) this.cachedData.buffer = this.source.buffer();
    return this.cachedData.buffer;
  }

  size() {
    if (!this.cachedData.size) this.cachedData.size = this.source.size();
    return this.cachedData.size;
  }

  sourceAndMap(options = { columns: true }) {
    return {
      source: this.source(),
      map: this.map(options),
    };
  }

  updateHash(hash) {
    this.source.updateHash(hash);
  }
}

class PrefixSource extends Source {
  constructor(prefix, source) {
    super();
    this.prefix = prefix;
    this.source = typeof source === 'string' || Buffer.isBuffer(source)
      ? new RawSource(source)
      : source;
  }

  source() {
    const src = this.source.source();
    return src.split('\n').map(line => this.prefix + line).join('\n');
  }
}

class ConcatSource extends Source {
  constructor(...items) {
    super();
    this.items = items;
  }

  add(item) {
    this.items.push(item);
  }

  source() {
    return this.items.map(item => (typeof item === 'string' ? item : item.source())).join('');
  }
}

class ReplaceSource extends Source {
  constructor(source) {
    super();
    this.sourceObj = source;
    this.replacements = [];
  }

  source() {
    let src = this.sourceObj.source();
    for (const { start, end, replacement } of this.replacements) {
      src = src.slice(0, start) + replacement + src.slice(end + 1);
    }
    return src;
  }

  replace(start, end, replacement) {
    this.replacements.push({ start, end, replacement });
  }

  insert(pos, insertion) {
    this.replacements.push({ start: pos, end: pos - 1, replacement: insertion });
  }

  original() {
    return this.sourceObj;
  }
}

class CompatSource extends Source {
  static from(sourceLike) {
    if (sourceLike instanceof Source) {
      return sourceLike;
    }
    return new RawSource(sourceLike);
  }
}

module.exports = {
  Source,
  RawSource,
  OriginalSource,
  SourceMapSource,
  CachedSource,
  PrefixSource,
  ConcatSource,
  ReplaceSource,
  CompatSource,
};
