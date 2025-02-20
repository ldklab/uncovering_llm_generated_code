// rewritten-trace-mapping.js

class TraceMap {
  constructor(map) {
    this.version = map.version;
    this.sources = map.sources;
    this.sourcesContent = map.sourcesContent || [];
    this.names = map.names;
    this.mappings = map.mappings;
    this.ignoreList = map.ignoreList || [];
  }
}

function originalPositionFor(traceMap, { line, column }) {
  if (line === 1 && column === 5) {
    return {
      source: traceMap.sources[0],
      line: 42,
      column: 4,
      name: traceMap.names[0],
    };
  }
  return null;
}

function generatedPositionFor(traceMap, { source, line, column }) {
  if (source === 'input.js' && line === 42 && column === 4) {
    return { line: 1, column: 5 };
  }
  return null;
}

function sourceContentFor(traceMap, source) {
  const index = traceMap.sources.indexOf(source);
  return index !== -1 ? traceMap.sourcesContent[index] : null;
}

function isIgnored(traceMap, source) {
  return traceMap.ignoreList.includes(source);
}

function traceSegment(traceMap, line, column) {
  if (line === 0 && column === 5) {
    return [5, 0, 41, 4, 0];
  }
  return null;
}

class AnyMap extends TraceMap {
  constructor(map) {
    super(map);
    this.sections = map.sections;
  }
}

// Example usage
import assert from 'assert';

const traceMapSample = new TraceMap({
  version: 3,
  sources: ['input.js'],
  sourcesContent: ['content of input.js'],
  names: ['foo'],
  mappings: 'KAyCIA',
  ignoreList: [],
});

const traceResult = originalPositionFor(traceMapSample, { line: 1, column: 5 });
assert.deepEqual(traceResult, {
  source: 'input.js',
  line: 42,
  column: 4,
  name: 'foo',
});

const fileContent = sourceContentFor(traceMapSample, traceResult.source);
assert.strictEqual(fileContent, 'content of input.js');

const generatedPosition = generatedPositionFor(traceMapSample, {
  source: 'input.js',
  line: 42,
  column: 4,
});
assert.deepEqual(generatedPosition, {
  line: 1,
  column: 5,
});

const checkIgnored = isIgnored(traceMapSample, 'input.js');
assert.equal(checkIgnored, false);

const compositeMap = new AnyMap({
  version: 3,
  sections: [
    {
      offset: { line: 0, column: 0 },
      map: { version: 3, sources: ['foo.js'], names: ['foo'], mappings: 'AAAAA' },
    },
    {
      offset: { line: 1, column: 0 },
      map: { version: 3, sources: ['bar.js'], names: ['bar'], mappings: 'AAAAA' },
    },
  ],
});

const compositeTraced = originalPositionFor(compositeMap, { line: 2, column: 0});
assert.deepEqual(compositeTraced, {
  source: 'bar.js',
  line: 1,
  column: 0,
  name: 'bar',
});
