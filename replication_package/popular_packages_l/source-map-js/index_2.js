class SourceMapConsumer {
    constructor(rawSourceMap) {
        this.rawSourceMap = typeof rawSourceMap === 'string' ? JSON.parse(rawSourceMap) : rawSourceMap;
        this.mappings = parseMappings(this.rawSourceMap.mappings); // parse mappings from the raw source map
    }
    
    originalPositionFor({ line, column }) {
        const mapping = findMapping(this.mappings, line, column, SourceMapConsumer.GREATEST_LOWER_BOUND);
        return {
            source: mapping ? this.rawSourceMap.sources[mapping.sourceIndex] : null,
            line: mapping ? mapping.originalLine : null,
            column: mapping ? mapping.originalColumn : null,
            name: mapping && mapping.nameIndex !== undefined ? this.rawSourceMap.names[mapping.nameIndex] : null
        };
    }

    generatedPositionFor({ source, line, column }) {
        const sourceIndex = this.rawSourceMap.sources.indexOf(source);
        const mapping = reverseFindMapping(this.mappings, sourceIndex, line, column);
        return {
            line: mapping ? mapping.generatedLine : null,
            column: mapping ? mapping.generatedColumn : null
        };
    }
    
    eachMapping(callback, context, order) {
        const sortedMappings = this.sortMappings(this.mappings, order);
        sortedMappings.forEach(mapping => {
            callback.call(context, {
                source: this.rawSourceMap.sources[mapping.sourceIndex],
                generatedLine: mapping.generatedLine,
                generatedColumn: mapping.generatedColumn,
                originalLine: mapping.originalLine,
                originalColumn: mapping.originalColumn,
                name: mapping.nameIndex !== undefined ? this.rawSourceMap.names[mapping.nameIndex] : null
            });
        });
    }
    
    sortMappings(mappings, order) {
        const comparator = order === SourceMapConsumer.ORIGINAL_ORDER ? originalOrderComparator : generatedOrderComparator;
        return [...mappings].sort(comparator);
    }

    static GREATEST_LOWER_BOUND = 1;
    static LEAST_UPPER_BOUND = 2;
}

class SourceMapGenerator {
    constructor({ file, sourceRoot }) {
        this.file = file;
        this.sourceRoot = sourceRoot;
        this.sources = [];
        this.names = [];
        this.mappings = [];
        this.sourcesContent = [];
    }

    addMapping({ source, original, generated, name }) {
        const sourceIndex = this.ensureSourceIndex(source);
        const nameIndex = this.ensureNameIndex(name);
        this.mappings.push({
            generatedLine: generated.line,
            generatedColumn: generated.column,
            originalLine: original.line,
            originalColumn: original.column,
            sourceIndex,
            nameIndex
        });
    }

    ensureSourceIndex(source) {
        let sourceIndex = this.sources.indexOf(source);
        if (sourceIndex === -1) {
            sourceIndex = this.sources.length;
            this.sources.push(source);
        }
        return sourceIndex;
    }

    ensureNameIndex(name) {
        if (!name) return -1;
        let nameIndex = this.names.indexOf(name);
        if (nameIndex === -1) {
            nameIndex = this.names.length;
            this.names.push(name);
        }
        return nameIndex;
    }

    setSourceContent(sourceFile, sourceContent) {
        const index = this.sources.indexOf(sourceFile);
        this.sourcesContent[index] = sourceContent;
    }

    toString() {
        return JSON.stringify({
            version: 3,
            file: this.file,
            sources: this.sources,
            names: this.names,
            sourceRoot: this.sourceRoot,
            sourcesContent: this.sourcesContent,
            mappings: serializeMappings(this.mappings)
        });
    }
}

class SourceNode {
    constructor(line, column, source, chunk, name) {
        this.children = [];
        this.line = line;
        this.column = column;
        this.source = source;
        this.name = name;
        if (chunk) {
            this.add(chunk);
        }
    }

    add(chunk) {
        if (Array.isArray(chunk)) {
            this.children.push(...chunk.map(c => c instanceof SourceNode ? c : new SourceNode(null, null, null, c)));
        } else if (chunk instanceof SourceNode || typeof chunk === 'string') {
            this.children.push(chunk);
        }
    }

    prepend(chunk) {
        if (Array.isArray(chunk)) {
            this.children.unshift(...chunk.map(c => c instanceof SourceNode ? c : new SourceNode(null, null, null, c)));
        } else if (chunk instanceof SourceNode || typeof chunk === 'string') {
            this.children.unshift(chunk);
        }
    }

    setSourceContent(sourceFile, sourceContent) {
        if (!this.sourcesContent)
            this.sourcesContent = new Map();

        this.sourcesContent.set(sourceFile, sourceContent);
    }

    toString() {
        return this.children
            .map(child => child.toString())
            .join('');
    }

    toStringWithSourceMap({ file }) {
        const map = new SourceMapGenerator({ file });
        const code = [];
        
        this.walk((chunk, original) => {
            if (original.source !== null) {
                map.addMapping({
                    generated: {
                        line: code.length > 0 ? code.join('').split('\n').length : 1,
                        column: code.length > 0 ? code.join('').split('\n').pop().length : 0
                    },
                    original: {
                        line: original.line,
                        column: original.column
                    },
                    source: original.source,
                    name: original.name
                });
            }
            code.push(chunk);
        });

        return {
            code: code.join(''),
            map
        };
    }

    walk(fn) {
        this.children.forEach(child => {
            if (child instanceof SourceNode) {
                child.walk(fn);
            } else {
                fn(child.toString(), { 
                    source: this.source, 
                    line: this.line, 
                    column: this.column, 
                    name: this.name 
                });
            }
        });
    }

    join(sep) {
        const newChildren = [];
        if (this.children.length > 0) {
            this.children.forEach(child => {
                newChildren.push(child);
                newChildren.push(new SourceNode(null, null, null, sep));
            });
            newChildren.pop(); // remove the last separator
        }
        return new SourceNode(this.line, this.column, this.source, newChildren);
    }

    replaceRight(pattern, replacement) {
        if (this.children.length > 0) {
            const lastChild = this.children[this.children.length - 1];
            if (typeof lastChild === 'string') {
                this.children[this.children.length - 1] = lastChild.replace(pattern, replacement);
            } else if (lastChild instanceof SourceNode) {
                lastChild.replaceRight(pattern, replacement);
            }
        }
    }
}

function parseMappings(mappings) {
    // Implement parsing for VLQ mappings string.
    return [];
}

function findMapping(mappings, line, column, bias) {
    // Implement finding the mapping
    return mappings.find(mapping =>
        mapping.generatedLine === line &&
        (bias === SourceMapConsumer.GREATEST_LOWER_BOUND
            ? mapping.generatedColumn <= column
            : mapping.generatedColumn >= column));
}

function reverseFindMapping(mappings, sourceIndex, line, column) {
    // Implement finding the reverse mapping
    return mappings.find(mapping =>
        mapping.sourceIndex === sourceIndex &&
        mapping.originalLine === line &&
        mapping.originalColumn === column);
}

function serializeMappings(mappings) {
    // Implement serialization for VLQ mappings string.
    return '';
}

module.exports = {
    SourceMapConsumer,
    SourceMapGenerator,
    SourceNode,
};
