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
  
  const sourceIndex = map.sources.indexOf(source);
  const nameIndex = name ? map.names.indexOf(name) : -1;
  map.mappings.push([generated, original, sourceIndex, nameIndex]);
}

function setSourceContent(map, source, content) {
  const index = map.sources.indexOf(source);
  if (index !== -1) {
    map.sourcesContent[index] = content;
  }
}

function toEncodedMap(map) {
  let encodedMappings = map.mappings.map((mapping) => {
    const [generated, original, sourceIndex, nameIndex] = mapping;
    return `${generated.line},${generated.column},${sourceIndex},${original.line},${original.column},${nameIndex};`;
  }).join('');
  
  return {
    version: 3,
    file: map.file,
    sourceRoot: map.sourceRoot,
    sources: map.sources,
    sourcesContent: map.sourcesContent,
    names: map.names,
    mappings: encodedMappings,
  };
}

function toDecodedMap(map) {
  const decodedMappings = map.mappings.map(([generated, original, sourceIndex, nameIndex]) => ({
    generated,
    source: map.sources[sourceIndex],
    original,
    name: nameIndex !== -1 ? map.names[nameIndex] : null,
  }));
  
  return {
    version: 3,
    file: map.file,
    sourceRoot: map.sourceRoot,
    sources: map.sources,
    sourcesContent: map.sourcesContent,
    names: map.names,
    mappings: decodedMappings,
  };
}

function maybeAddMapping(map, { generated, source, original, name }) {
  const duplicateExists = map.mappings.some(([gen, orig]) => 
    gen.line === generated.line && orig.line === original.line
  );
  
  if (!source || duplicateExists) return;
  addMapping(map, { generated, source, original, name });
}

// Usage example
const map = new GenMapping({ file: 'output.js', sourceRoot: 'https://example.com/' });
setSourceContent(map, 'input.js', 'function foo() {}');
addMapping(map, { generated: { line: 1, column: 0 }, source: 'input.js', original: { line: 1, column: 0 } });
addMapping(map, { generated: { line: 1, column: 9 }, source: 'input.js', original: { line: 1, column: 9 }, name: 'foo' });
console.log(toDecodedMap(map));
console.log(toEncodedMap(map));
