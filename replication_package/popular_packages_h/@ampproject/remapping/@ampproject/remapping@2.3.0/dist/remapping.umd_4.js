(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(require('@jridgewell/trace-mapping'), require('@jridgewell/gen-mapping'));
    } else if (typeof define === 'function' && define.amd) {
        define(['@jridgewell/trace-mapping', '@jridgewell/gen-mapping'], factory);
    } else {
        global = typeof globalThis !== 'undefined' ? globalThis : global || self;
        global.remapping = factory(global.traceMapping, global.genMapping);
    }
})(this, (function (traceMapping, genMapping) {

    const SOURCELESS_MAPPING = createSegmentObject('', -1, -1, '', null, false);
    const EMPTY_SOURCES = [];

    function createSegmentObject(source, line, column, name, content, ignore) {
        return { source, line, column, name, content, ignore };
    }

    function createSource(map, sources, source, content, ignore) {
        return { map, sources, source, content, ignore };
    }

    function MapSource(map, sources) {
        return createSource(map, sources, '', null, false);
    }

    function OriginalSource(source, content, ignore) {
        return createSource(null, EMPTY_SOURCES, source, content, ignore);
    }

    function traceMappings(tree) {
        const gen = new genMapping.GenMapping({ file: tree.map.file });
        const { sources: rootSources, map } = tree;
        const rootNames = map.names;
        const rootMappings = traceMapping.decodedMappings(map);

        rootMappings.forEach((segments, i) => {
            segments.forEach(segment => {
                const genCol = segment[0];
                let traced = SOURCELESS_MAPPING;

                if (segment.length !== 1) {
                    const source = rootSources[segment[1]];
                    traced = originalPositionFor(source, segment[2], segment[3], segment.length === 5 ? rootNames[segment[4]] : '');
                    if (!traced) return;
                }

                const { column, line, name, content, source, ignore } = traced;
                genMapping.maybeAddSegment(gen, i, genCol, source, line, column, name);
                if (source && content !== null) genMapping.setSourceContent(gen, source, content);
                if (ignore) genMapping.setIgnore(gen, source, true);
            });
        });

        return gen;
    }

    function originalPositionFor(source, line, column, name) {
        if (!source.map) {
            return createSegmentObject(source.source, line, column, name, source.content, source.ignore);
        }
        const segment = traceMapping.traceSegment(source.map, line, column);
        if (!segment) return null;
        if (segment.length === 1) return SOURCELESS_MAPPING;
        return originalPositionFor(source.sources[segment[1]], segment[2], segment[3], segment.length === 5 ? source.map.names[segment[4]] : name);
    }

    function asArray(value) {
        return Array.isArray(value) ? value : [value];
    }

    function buildSourceMapTree(input, loader) {
        const maps = asArray(input).map((m) => new traceMapping.TraceMap(m, ''));
        const map = maps.pop();
        maps.forEach((map, i) => {
            if (map.sources.length > 1) {
                throw new Error(`Transformation map ${i} must have exactly one source file.\n` +
                    'Did you specify these with the most recent transformation maps first?');
            }
        });

        let tree = build(map, loader, '', 0);
        for (let i = maps.length - 1; i >= 0; i--) {
            tree = MapSource(maps[i], [tree]);
        }
        return tree;
    }

    function build(map, loader, importer, importerDepth) {
        const { resolvedSources, sourcesContent, ignoreList } = map;
        const depth = importerDepth + 1;
        const children = resolvedSources.map((sourceFile, i) => {
            const ctx = {
                importer,
                depth,
                source: sourceFile || '',
                content: undefined,
                ignore: undefined,
            };

            const sourceMap = loader(ctx.source, ctx);
            const { source, content, ignore } = ctx;
            if (sourceMap) {
                return build(new traceMapping.TraceMap(sourceMap, source), loader, source, depth);
            }
            const sourceContent = content !== undefined ? content : sourcesContent ? sourcesContent[i] : null;
            const ignored = ignore !== undefined ? ignore : ignoreList ? ignoreList.includes(i) : false;
            return OriginalSource(source, sourceContent, ignored);
        });

        return MapSource(map, children);
    }

    class SourceMap {
        constructor(map, options) {
            const out = options.decodedMappings ? genMapping.toDecodedMap(map) : genMapping.toEncodedMap(map);
            this.version = out.version;
            this.file = out.file;
            this.mappings = out.mappings;
            this.names = out.names;
            this.ignoreList = out.ignoreList;
            this.sourceRoot = out.sourceRoot;
            this.sources = out.sources;
            if (!options.excludeContent) {
                this.sourcesContent = out.sourcesContent;
            }
        }

        toString() {
            return JSON.stringify(this);
        }
    }

    function remapping(input, loader, options) {
        const opts = typeof options === 'object' ? options : { excludeContent: !!options, decodedMappings: false };
        const tree = buildSourceMapTree(input, loader);
        return new SourceMap(traceMappings(tree), opts);
    }

    return remapping;

}));
//# sourceMappingURL=remapping.umd.js.map
