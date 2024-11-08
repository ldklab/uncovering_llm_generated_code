class SourceMapGenerator {
  constructor({ file, sourceRoot, skipValidation } = {}) {
    this.file = file || null;
    this.sourceRoot = sourceRoot || null;
    this.skipValidation = Boolean(skipValidation);
    this.mappings = [];
    this.sourcesContent = {};
  }

  addMapping({ generated, original, source, name }) {
    if (!this.skipValidation) {
      // Potential validation logic
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
    const mappings = order === SourceMapConsumer.ORIGINAL_ORDER ? [...this.mappings].sort((a, b) => a.original.line - b.original.line) : this.mappings;
    mappings.forEach(callback, context);
  }

  destroy() {
    this.mappings = null;
  }

  _parseMappings(mappings) {
    return mappings.split(';').map(m => {
      const [generatedLine, generatedColumn, source, originalLine, originalColumn, name] = m.split(',');
      return {
        generated: { line: parseInt(generatedLine, 10), column: parseInt(generatedColumn, 10) },
        original: { line: parseInt(originalLine, 10), column: parseInt(originalColumn, 10) },
        source,
        name,
      };
    });
  }
}

class SourceNode {
  constructor(line, col, source, chunk, name) {
    this.children = [];
    this.line = line || null;
    this.column = col || null;
    this.source = source || null;
    this.name = name || null;
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
