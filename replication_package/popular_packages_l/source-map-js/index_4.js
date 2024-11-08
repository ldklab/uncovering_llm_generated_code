class SourceMapConsumer {
    constructor(rawSourceMap) {
        this.rawSourceMap = typeof rawSourceMap === 'string' ? JSON.parse(rawSourceMap) : rawSourceMap;
        this.mappings = parseMappings(this.rawSourceMap.mappings);
    }

    originalPositionFor({ line, column }) {
        const mapping = findMapping(this.mappings, line, column, SourceMapConsumer.GREATEST_LOWER_BOUND);
        return mapping ? {
            source: this.rawSourceMap.sources[mapping.sourceIndex],
            line: mapping.originalLine,
            column: mapping.originalColumn,
            name: mapping.nameIndex !== undefined ? this.rawSourceMap.names[mapping.nameIndex] : null
        } : { source: null, line: null, column: null, name: null };
    }

    generatedPositionFor({ source, line, column }) {
        const sourceIndex = this.rawSourceMap.sources.indexOf(source);
        const mapping = reverseFindMapping(this.mappings, sourceIndex, line, column);
        return mapping ? { line: mapping.generatedLine, column: mapping.generatedColumn } : { line: null, column: null };
    }
    
    eachMapping(callback, context, order) {
        const comparator = order === SourceMapConsumer.ORIGINAL_ORDER ? originalOrderComparator : generatedOrderComparator;
        [...this.mappings].sort(comparator).forEach(mapping => {
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
        let sourceIndex = getOrAddItem(this.sources, source);
        let nameIndex = name ? getOrAddItem(this.names, name) : undefined;

        this.mappings.push({ generatedLine: generated.line, generatedColumn: generated.column, originalLine: original.line, originalColumn: original.column, sourceIndex, nameIndex });
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
        if (chunk) this.add(chunk);
    }

    add(chunk) {
        if (Array.isArray(chunk)) {
            this.children.push(...chunk.map(c => typeof c === 'string' || c instanceof SourceNode ? c : new SourceNode(null, null, null, c)));
        } else if (typeof chunk === 'string' || chunk instanceof SourceNode) {
            this.children.push(chunk);
        }
    }

    prepend(chunk) {
        if (Array.isArray(chunk)) {
            this.children.unshift(...chunk.map(c => typeof c === 'string' || c instanceof SourceNode ? c : new SourceNode(null, null, null, c)));
        } else if (typeof chunk === 'string' || chunk instanceof SourceNode) {
            this.children.unshift(chunk);
        }
    }

    setSourceContent(sourceFile, sourceContent) {
        if (!this.sourcesContent) this.sourcesContent = new Map();
        this.sourcesContent.set(sourceFile, sourceContent);
    }

    toString() {
        return this.children.map(child => child.toString()).join('');
    }

    toStringWithSourceMap({ file }) {
        const map = new SourceMapGenerator({ file });
        const code = [];

        this.walk((chunk, original) => {
            const generatedPosition = {
                line: code.join('').split('\n').length,
                column: code.join('').split('\n').pop().length
            };

            if (original.source !== null) {
                map.addMapping({ generated: generatedPosition, original, source: original.source, name: original.name });
            }
            code.push(chunk);
        });

        return { code: code.join(''), map };
    }

    walk(fn) {
        this.children.forEach(child => {
            if (child instanceof SourceNode) {
                child.walk(fn);
            } else {
                fn(child.toString(), { source: this.source, line: this.line, column: this.column, name: this.name });
            }
        });
    }

    join(sep) {
        const newChildren = [];
        if (this.children.length) this.children.forEach(child => newChildren.push(child, new SourceNode(null, null, null, sep)));
        newChildren.pop();
        return new SourceNode(this.line, this.column, this.source, newChildren);
    }

    replaceRight(pattern, replacement) {
        if (this.children.length) {
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
    return [];
}

function findMapping(mappings, line, column, bias) {
    return mappings.find(mapping =>
        mapping.generatedLine === line &&
        (bias === SourceMapConsumer.GREATEST_LOWER_BOUND ? mapping.generatedColumn <= column : mapping.generatedColumn >= column));
}

function reverseFindMapping(mappings, sourceIndex, line, column) {
    return mappings.find(mapping =>
        mapping.sourceIndex === sourceIndex &&
        mapping.originalLine === line &&
        mapping.originalColumn === column);
}

function serializeMappings(mappings) {
    return '';
}

function getOrAddItem(arr, item) {
    let index = arr.indexOf(item);
    if (index === -1) {
        index = arr.length;
        arr.push(item);
    }
    return index;
}

function originalOrderComparator(a, b) {
    return (a.originalLine - b.originalLine) || (a.originalColumn - b.originalColumn);
}

function generatedOrderComparator(a, b) {
    return (a.generatedLine - b.generatedLine) || (a.generatedColumn - b.generatedColumn);
}

module.exports = {
    SourceMapConsumer,
    SourceMapGenerator,
    SourceNode
};
