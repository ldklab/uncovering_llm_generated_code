class SourceMap {
  constructor({ file = '', sourceRoot = '' } = {}) {
    this.file = file;
    this.sourceRoot = sourceRoot;
    this.names = [];
    this.sources = [];
    this.sourcesContent = [];
    this.mappings = [];
  }
}

function insertMapping(map, { generated, source, original, name }) {
  const sourceIndex = map.sources.indexOf(source);
  if (sourceIndex === -1) {
    map.sources.push(source);
    map.sourcesContent.push(null);
  }
  if (name && !map.names.includes(name)) {
    map.names.push(name);
  }
  map.mappings.push([
    generated,
    original,
    map.sources.indexOf(source),
    map.names.indexOf(name)
  ]);
}

function updateSourceContent(map, source, content) {
  const index = map.sources.indexOf(source);
  if (index >= 0) {
    map.sourcesContent[index] = content;
  }
}

function generateEncodedMap(map) {
  const mappingStrings = map.mappings.map(([gen, orig, srcIdx, nameIdx]) => 
    `${gen.line},${gen.column},${srcIdx},${orig.line},${orig.column},${nameIdx};`
  ).join('');
  return {
    version: 3,
    file: map.file,
    sourceRoot: map.sourceRoot,
    sources: map.sources,
    sourcesContent: map.sourcesContent,
    names: map.names,
    mappings: mappingStrings
  };
}

function generateDecodedMap(map) {
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
      name: nameIdx !== -1 ? map.names[nameIdx] : null
    }))
  };
}

function conditionallyInsertMapping(map, { generated, source, original, name }) {
  if (!source) return;
  const exists = map.mappings.some(([gen, orig]) => 
    gen.line === generated.line && orig.line === original.line
  );
  if (!exists) {
    insertMapping(map, { generated, source, original, name });
  }
}

// Usage:
const smap = new SourceMap({ file: 'output.js', sourceRoot: 'https://example.com/' });
updateSourceContent(smap, 'input.js', 'function foo() {}');
insertMapping(smap, { generated: { line: 1, column: 0 }, source: 'input.js', original: { line: 1, column: 0 } });
insertMapping(smap, { generated: { line: 1, column: 9 }, source: 'input.js', original: { line: 1, column: 9 }, name: 'foo' });
console.log(generateDecodedMap(smap));
console.log(generateEncodedMap(smap));
