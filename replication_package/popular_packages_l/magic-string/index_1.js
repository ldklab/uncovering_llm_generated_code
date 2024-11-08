class MagicString {
  constructor(originalString, options = {}) {
    this.originalString = originalString;
    this.modifiedString = originalString;
    this.changes = [];
    this.options = options;
  }

  update(start, end, content) {
    this.modifiedString = this.modifiedString.slice(0, start) + content + this.modifiedString.slice(end);
    this.changes.push({ type: 'update', start, end, content });
    return this;
  }

  append(content) {
    this.modifiedString += content;
    this.changes.push({ type: 'append', content });
    return this;
  }

  prepend(content) {
    this.modifiedString = content + this.modifiedString;
    this.changes.push({ type: 'prepend', content });
    return this;
  }

  generateMap(options = {}) {
    const map = {
      version: 3,
      file: options.file || 'output.js',
      sources: [options.source || 'input.js'],
      names: [],
      mappings: 'AAAA'
    };

    if (options.includeContent) {
      map.sourcesContent = [this.originalString];
    }

    return {
      ...map,
      toString: () => JSON.stringify(map),
      toUrl: () => `data:application/json;charset=utf-8;base64,${btoa(JSON.stringify(map))}`
    };
  }

  toString() {
    return this.modifiedString;
  }

  clone() {
    return new MagicString(this.originalString, this.options);
  }
}

MagicString.Bundle = class {
  constructor() {
    this.sources = [];
    this.indentString = '  ';
  }

  addSource(source) {
    this.sources.push(source);
    return this;
  }

  indent(indentStr) {
    if (indentStr) {
      this.indentString = indentStr;
    }
    this.sources = this.sources.map(
      source => new MagicString(source.modifiedString.replace(/^/gm, this.indentString))
    );
    return this;
  }

  toString() {
    return this.sources.map(source => source.toString()).join('\n');
  }

  generateMap(options = {}) {
    const map = {
      version: 3,
      file: options.file || 'bundle.js',
      sources: this.sources.map(source => source.options.filename || 'unknown'),
      mappings: '',
    };

    if (options.includeContent) {
      map.sourcesContent = this.sources.map(source => source.originalString);
    }

    return {
      ...map,
      toString: () => JSON.stringify(map),
      toUrl: () => `data:application/json;charset=utf-8;base64,${btoa(JSON.stringify(map))}`
    };
  }
};

export default MagicString;
