// Source Map Library Implementation

class SourceMapGenerator {
  constructor({ file = null, sourceRoot = null, skipValidation = false } = {}) {
    this.file = file;
    this.sourceRoot = sourceRoot;
    this.skipValidation = skipValidation;
    this.mappings = [];
    this.sourcesContent = {};
  }

  addMapping({ generated, original, source, name }) {
    if (!this.skipValidation) {
      // Perform validation if required
    }
    this.mappings.push({ generated, original, source, name });
  }

  setSourceContent(sourceFile, sourceContent) {
    this.sourcesContent[sourceFile] = sourceContent;
  }

  toString() {
    return JSON.stringify({
      version: 3,
      file: this.file,
      sources: Object.keys(this.sourcesContent),
      sourcesContent: Object.values(this.sourcesContent),
      mappings: this._serializeMappings()
    });
  }

  _serializeMappings() {
    return this.mappings.map(({ generated }) => `${generated.line},${generated.column}`).join(';');
  }
}

class SourceMapConsumer {
  constructor(rawSourceMap) {
    this.rawSourceMap = rawSourceMap;
    this.mappings = this._parseMappings(rawSourceMap.mappings);
  }

  static async with(rawSourceMap, sourceMapUrl, callback) {
    const consumer = new SourceMapConsumer(rawSourceMap);
    try {
      return await callback(consumer);
    } finally {
      consumer.destroy();
    }
  }

  originalPositionFor({ line, column }) {
    const mapping = this.mappings.find(m => m.generated.line === line && m.generated.column === column);
    if (!mapping) return { source: null, line: null, column: null, name: null };
    return { source: mapping.source, line: mapping.original.line, column: mapping.original.column, name: mapping.name };
  }

  generatedPositionFor({ source, line, column }) {
    const mapping = this.mappings.find(m => m.source === source && m.original.line === line && m.original.column === column);
    if (!mapping) return { line: null, column: null };
    return { line: mapping.generated.line, column: mapping.generated.column };
  }

  eachMapping(callback, context, order) {
    const sortedMappings = order === SourceMapConsumer.ORIGINAL_ORDER
      ? [...this.mappings].sort((a, b) => a.original.line - b.original.line)
      : this.mappings;
    sortedMappings.forEach(callback, context);
  }

  destroy() {
    this.mappings = null;
  }

  _parseMappings(mappings) {
    return mappings.split(';').map(m => {
      const [genLine, genCol, source, origLine, origCol, name] = m.split(',');
      return {
        generated: { line: Number(genLine), column: Number(genCol) },
        original: { line: Number(origLine), column: Number(origCol) },
        source,
        name,
      };
    });
  }
}

class SourceNode {
  constructor(line = null, col = null, source = null, chunk = null, name = null) {
    this.children = [];
    this.line = line;
    this.column = col;
    this.source = source;
    this.name = name;
    if (chunk) this.add(chunk);
  }

  add(chunk) {
    if (Array.isArray(chunk)) {
      chunk.forEach(subChunk => this.add(subChunk));
    } else {
      this.children.push(chunk);
    }
  }

  toString() {
    return this.children.map(child => (child instanceof SourceNode ? child.toString() : child)).join('');
  }

  toStringWithSourceMap(startOfSourceMap) {
    const map = new SourceMapGenerator(startOfSourceMap);
    this.walk((chunk, loc) => {
      map.addMapping({ source: loc.source, original: loc, generated: loc, name: loc.name });
    });
    return {
      code: this.toString(),
      map
    };
  }

  walk(fn) {
    this.children.forEach(child => {
      if (child instanceof SourceNode) {
        child.walk(fn);
      } else {
        fn(child, { source: this.source, line: this.line, column: this.column, name: this.name });
      }
    });
  }
}

module.exports = {
  SourceMapGenerator,
  SourceMapConsumer,
  SourceNode
};
