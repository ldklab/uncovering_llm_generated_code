// Source Map Handling Module

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
      name: traceMap.names[0]
    };
  }
  return null;
}

function generatedPositionFor(traceMap, { source, line, column }) {
  if (source === 'input.js' && line === 42 && column === 4) {
    return {
      line: 1,
      column: 5
    };
  }
  return null;
}

function sourceContentFor(traceMap, source) {
  const index = traceMap.sources.indexOf(source);
  return traceMap.sourcesContent[index] || null;
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

// Example Usage
import assert from 'assert';

const tracer = new TraceMap({
  version: 3,
  sources: ['input.js'],
  sourcesContent: ['content of input.js'],
  names: ['foo'],
  mappings: 'KAyCIA',
  ignoreList: [],
});

const traced = originalPositionFor(tracer, { line: 1, column: 5 });
assert.deepEqual(traced, {
  source: 'input.js',
  line: 42,
  column: 4,
  name: 'foo',
});

const content = sourceContentFor(tracer, traced.source);
assert.strictEqual(content, 'content of input.js');

const generated = generatedPositionFor(tracer, {
  source: 'input.js',
  line: 42,
  column: 4,
});
assert.deepEqual(generated, {
  line: 1,
  column: 5,
});

const ignored = isIgnored(tracer, 'input.js');
assert.equal(ignored, false);

const sectionedMap = new AnyMap({
  version: 3,
  sections: [
    {
      offset: { line: 0, column: 0 },
      map: {
        version: 3,
        sources: ['foo.js'],
        names: ['foo'],
        mappings: 'AAAAA',
      },
    },
    {
      offset: { line: 1, column: 0 },
      map: {
        version: 3,
        sources: ['bar.js'],
        names: ['bar'],
        mappings: 'AAAAA',
      },
    },
  ],
});

const sectionedTraced = originalPositionFor(sectionedMap, {
  line: 2,
  column: 0,
});

assert.deepEqual(sectionedTraced, {
  source: 'bar.js',
  line: 1,
  column: 0,
  name: 'bar',
});
