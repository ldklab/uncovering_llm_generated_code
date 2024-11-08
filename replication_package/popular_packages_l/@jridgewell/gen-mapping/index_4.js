class GenMapping {
  constructor({ file, sourceRoot } = {}) {
    this.file = file || '';
    this.sourceRoot = sourceRoot || '';
    this.names = [];
    this.sources = [];
    this.sourcesContent = [];
    this.mappings = [];
  }
}

function addMapping(map, { generated, source, original, name }) {
  if (!map.sources.includes(source)) {
    map.sources.push(source);
    map.sourcesContent.push(null);
  }
  if (name && !map.names.includes(name)) {
    map.names.push(name);
  }
  map.mappings.push([generated, original, map.sources.indexOf(source), map.names.indexOf(name)]);
}

function setSourceContent(map, source, content) {
  const index = map.sources.indexOf(source);
  if (index !== -1) {
    map.sourcesContent[index] = content;
  }
}

function toEncodedMap(map) {
  return {
    version: 3,
    file: map.file,
    sourceRoot: map.sourceRoot,
    sources: map.sources,
    sourcesContent: map.sourcesContent,
    names: map.names,
    mappings: map.mappings.map(([gen, orig, srcIdx, nameIdx]) => 
      `${gen.line},${gen.column},${srcIdx},${orig.line},${orig.column},${nameIdx}`).join(';')
  };
}

function toDecodedMap(map) {
  return {
    version: 3,
    file: map.file,
    sourceRoot: map.sourceRoot,
    sources: map.sources,
    sourcesContent: map.sourcesContent,
    names: map.names,
    mappings: map.mappings.map(([gen, orig, srcIdx, nameIdx]) => ({
      generated: gen,
      source: map.sources[srcIdx],
      original: orig,
      name: map.names[nameIdx],
    }))
  };
}

function maybeAddMapping(map, { generated, source, original, name }) {
  if (!source) return;
  const existing = map.mappings.some(([gen, orig]) => 
    gen.line === generated.line && orig.line === original.line);
  if (!existing) {
    addMapping(map, { generated, source, original, name });
  }
}

// Usage:
const map = new GenMapping({ file: 'output.js', sourceRoot: 'https://example.com/' });
setSourceContent(map, 'input.js', 'function foo() {}');
addMapping(map, { generated: { line: 1, column: 0 }, source: 'input.js', original: { line: 1, column: 0 } });
addMapping(map, { generated: { line: 1, column: 9 }, source: 'input.js', original: { line: 1, column: 9 }, name: 'foo' });
console.log(toDecodedMap(map));
console.log(toEncodedMap(map));
