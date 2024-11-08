(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@jridgewell/set-array'), require('@jridgewell/sourcemap-codec'), require('@jridgewell/trace-mapping'));
    } else if (typeof define === 'function' && define.amd) {
        define(['exports', '@jridgewell/set-array', '@jridgewell/sourcemap-codec', '@jridgewell/trace-mapping'], factory);
    } else {
        global = typeof globalThis !== 'undefined' ? globalThis : global || self;
        factory(global.genMapping = {}, global.setArray, global.sourcemapCodec, global.traceMapping);
    }
})(this, (function (exports, setArray, sourcemapCodec, traceMapping) {
    'use strict';

    const COLUMN = 0, SOURCES_INDEX = 1, SOURCE_LINE = 2, SOURCE_COLUMN = 3, NAMES_INDEX = 4;
    const NO_NAME = -1;

    class GenMapping {
        constructor({ file, sourceRoot } = {}) {
            this._names = new setArray.SetArray();
            this._sources = new setArray.SetArray();
            this._sourcesContent = [];
            this._mappings = [];
            this.file = file;
            this.sourceRoot = sourceRoot;
            this._ignoreList = new setArray.SetArray();
        }
    }

    function cast(map) { return map; }

    function addSegment(map, genLine, genColumn, source, sourceLine, sourceColumn, name, content) {
        return addSegmentInternal(false, map, genLine, genColumn, source, sourceLine, sourceColumn, name, content);
    }

    function addMapping(map, mapping) {
        return addMappingInternal(false, map, mapping);
    }

    const maybeAddSegment = (map, genLine, genColumn, source, sourceLine, sourceColumn, name, content) => {
        return addSegmentInternal(true, map, genLine, genColumn, source, sourceLine, sourceColumn, name, content);
    };

    const maybeAddMapping = (map, mapping) => {
        return addMappingInternal(true, map, mapping);
    };

    function setSourceContent(map, source, content) {
        const { _sources: sources, _sourcesContent: sourcesContent } = cast(map);
        const index = setArray.put(sources, source);
        sourcesContent[index] = content;
    }

    function setIgnore(map, source, ignore = true) {
        const { _sources: sources, _sourcesContent: sourcesContent, _ignoreList: ignoreList } = cast(map);
        const index = setArray.put(sources, source);
        if (index === sourcesContent.length) sourcesContent[index] = null;
        ignore ? setArray.put(ignoreList, index) : setArray.remove(ignoreList, index);
    }

    function toDecodedMap(map) {
        const { _mappings: mappings, _sources: sources, _sourcesContent: sourcesContent, _names: names, _ignoreList: ignoreList } = cast(map);
        removeEmptyFinalLines(mappings);
        return {
            version: 3,
            file: map.file || undefined,
            names: names.array,
            sourceRoot: map.sourceRoot || undefined,
            sources: sources.array,
            sourcesContent,
            mappings,
            ignoreList: ignoreList.array,
        };
    }

    function toEncodedMap(map) {
        const decoded = toDecodedMap(map);
        return { ...decoded, mappings: sourcemapCodec.encode(decoded.mappings) };
    }

    function fromMap(input) {
        const map = new traceMapping.TraceMap(input);
        const gen = new GenMapping({ file: map.file, sourceRoot: map.sourceRoot });
        putAll(cast(gen)._names, map.names);
        putAll(cast(gen)._sources, map.sources);
        cast(gen)._sourcesContent = map.sourcesContent || map.sources.map(() => null);
        cast(gen)._mappings = traceMapping.decodedMappings(map);
        if (map.ignoreList) putAll(cast(gen)._ignoreList, map.ignoreList);
        return gen;
    }

    function allMappings(map) {
        const out = [];
        const { _mappings: mappings, _sources: sources, _names: names } = cast(map);
        mappings.forEach((line, i) => {
            line.forEach(seg => {
                const generated = { line: i + 1, column: seg[COLUMN] };
                let source, original = undefined, name = undefined;
                if (seg.length !== 1) {
                    source = sources.array[seg[SOURCES_INDEX]];
                    original = { line: seg[SOURCE_LINE] + 1, column: seg[SOURCE_COLUMN] };
                    if (seg.length === 5) name = names.array[seg[NAMES_INDEX]];
                }
                out.push({ generated, source, original, name });
            });
        });
        return out;
    }

    function addSegmentInternal(skipable, map, genLine, genColumn, source, sourceLine, sourceColumn, name, content) {
        const { _mappings: mappings, _sources: sources, _sourcesContent: sourcesContent, _names: names } = cast(map);
        const line = getLine(mappings, genLine);
        const index = getColumnIndex(line, genColumn);

        if (!source) {
            if (skipable && skipSourceless(line, index)) return;
            return insert(line, index, [genColumn]);
        }

        const sourcesIndex = setArray.put(sources, source);
        const namesIndex = name ? setArray.put(names, name) : NO_NAME;
        if (sourcesIndex === sourcesContent.length) sourcesContent[sourcesIndex] = content ?? null;

        if (skipable && skipSource(line, index, sourcesIndex, sourceLine, sourceColumn, namesIndex)) {
            return;
        }

        return insert(line, index, name
            ? [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex]
            : [genColumn, sourcesIndex, sourceLine, sourceColumn]);
    }

    function getLine(mappings, index) {
        for (let i = mappings.length; i <= index; i++) {
            mappings[i] = [];
        }
        return mappings[index];
    }

    function getColumnIndex(line, genColumn) {
        let index = line.length;
        for (let i = index - 1; i >= 0; index = i--) {
            if (genColumn >= line[i][COLUMN]) break;
        }
        return index;
    }

    function insert(array, index, value) {
        for (let i = array.length; i > index; i--) {
            array[i] = array[i - 1];
        }
        array[index] = value;
    }

    function removeEmptyFinalLines(mappings) {
        let len = mappings.length;
        while (len > 0 && mappings[len - 1].length === 0) {
            len--;
        }
        if (len < mappings.length) mappings.length = len;
    }

    function putAll(setarr, array) {
        array.forEach(item => setArray.put(setarr, item));
    }

    function skipSourceless(line, index) {
        return index === 0 || line[index - 1].length === 1;
    }

    function skipSource(line, index, sourcesIndex, sourceLine, sourceColumn, namesIndex) {
        if (index === 0) return false;
        const prev = line[index - 1];
        return prev.length > 1 && 
            sourcesIndex === prev[SOURCES_INDEX] &&
            sourceLine === prev[SOURCE_LINE] &&
            sourceColumn === prev[SOURCE_COLUMN] &&
            namesIndex === (prev.length === 5 ? prev[NAMES_INDEX] : NO_NAME);
    }

    function addMappingInternal(skipable, map, mapping) {
        const { generated, source, original, name, content } = mapping;
        return addSegmentInternal(skipable, map, generated.line - 1, generated.column, source, original?.line - 1, original?.column, name, content);
    }

    exports.GenMapping = GenMapping;
    exports.addMapping = addMapping;
    exports.addSegment = addSegment;
    exports.allMappings = allMappings;
    exports.fromMap = fromMap;
    exports.maybeAddMapping = maybeAddMapping;
    exports.maybeAddSegment = maybeAddSegment;
    exports.setIgnore = setIgnore;
    exports.setSourceContent = setSourceContent;
    exports.toDecodedMap = toDecodedMap;
    exports.toEncodedMap = toEncodedMap;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
