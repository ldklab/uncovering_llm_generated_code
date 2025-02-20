(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(require('@jridgewell/trace-mapping'), require('@jridgewell/gen-mapping'));
    } else if (typeof define === 'function' && define.amd) {
        define(['@jridgewell/trace-mapping', '@jridgewell/gen-mapping'], factory);
    } else {
        root = typeof globalThis !== 'undefined' ? globalThis : root || self;
        root.remapping = factory(root.traceMapping, root.genMapping);
    }
})(this, function (traceMapping, genMapping) {
    'use strict';

    const SOURCELESS_MAPPING = createSegmentObject('', -1, -1, '', null, false);
    const EMPTY_SOURCES = [];

    function createSegmentObject(source, line, column, name, content, ignore) {
        return { source, line, column, name, content, ignore };
    }

    function createSource(map, sources, source, content, ignore) {
        return { map, sources, source, content, ignore };
    }

    function createMapSource(map, sources) {
        return createSource(map, sources, '', null, false);
    }

    function createOriginalSource(source, content, ignore) {
        return createSource(null, EMPTY_SOURCES, source, content, ignore);
    }

    function traceMappings(tree) {
        const generator = new genMapping.GenMapping({ file: tree.map.file });
        const { sources: rootSources, map } = tree;
        const rootNames = map.names;
        const rootMappings = traceMapping.decodedMappings(map);
        
        rootMappings.forEach((segments, genLine) => {
            segments.forEach(segment => {
                const genCol = segment[0];
                let traced = segment.length === 1 ? SOURCELESS_MAPPING : originalPositionFor(rootSources[segment[1]], segment[2], segment[3], segment.length === 5 ? rootNames[segment[4]] : '');
                if (traced) {
                    const { column, line, name, content, source, ignore } = traced;
                    genMapping.maybeAddSegment(generator, genLine, genCol, source, line, column, name);
                    if (source && content != null) genMapping.setSourceContent(generator, source, content);
                    if (ignore) genMapping.setIgnore(generator, source, true);
                }
            });
        });

        return generator;
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

    function makeArray(value) {
        return Array.isArray(value) ? value : [value];
    }

    function buildSourceMapTree(input, loader) {
        const maps = makeArray(input).map((m) => new traceMapping.TraceMap(m, ''));
        const map = maps.pop();

        maps.forEach((map, index) => {
            if (map.sources.length > 1) {
                throw new Error(`Transformation map ${index} must have exactly one source file.\nDid you specify these with the most recent transformation maps first?`);
            }
        });

        let tree = build(map, loader, '', 0);

        for (let i = maps.length - 1; i >= 0; i--) {
            tree = createMapSource(maps[i], [tree]);
        }

        return tree;
    }

    function build(map, loader, importer, depth) {
        const { resolvedSources, sourcesContent, ignoreList } = map;
        depth += 1;
        
        const children = resolvedSources.map((sourceFile, i) => {
            const ctx = { importer, depth, source: sourceFile || '', content: undefined, ignore: undefined };
            const sourceMap = loader(ctx.source, ctx);

            const { source, content, ignore } = ctx;
            if (sourceMap) {
                return build(new traceMapping.TraceMap(sourceMap, source), loader, source, depth);
            }

            const sourceContent = content !== undefined ? content : sourcesContent ? sourcesContent[i] : null;
            const ignored = ignore !== undefined ? ignore : ignoreList ? ignoreList.includes(i) : false;
            return createOriginalSource(source, sourceContent, ignored);
        });

        return createMapSource(map, children);
    }

    class SourceMap {
        constructor(map, options) {
            const output = options.decodedMappings ? genMapping.toDecodedMap(map) : genMapping.toEncodedMap(map);
            this.version = output.version;
            this.file = output.file;
            this.mappings = output.mappings;
            this.names = output.names;
            this.ignoreList = output.ignoreList;
            this.sourceRoot = output.sourceRoot;
            this.sources = output.sources;
            if (!options.excludeContent) this.sourcesContent = output.sourcesContent;
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
});
