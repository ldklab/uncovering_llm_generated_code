'use strict';

const sourcemapCodec = require('@jridgewell/sourcemap-codec');

class BitSet {
    constructor(arg) {
        this.bits = arg instanceof BitSet ? arg.bits.slice() : [];
    }
    add(n) {
        this.bits[n >> 5] |= 1 << (n & 31);
    }
    has(n) {
        return !!(this.bits[n >> 5] & (1 << (n & 31)));
    }
}

class Chunk {
    constructor(start, end, content) {
        this.start = start;
        this.end = end;
        this.original = content;
        this.intro = '';
        this.outro = '';
        this.content = content;
        this.storeName = false;
        this.edited = false;
        this.previous = null;
        this.next = null;
    }

    addContent(direction, content) {
        if (direction === 'left') {
            this.outro += content;
        } else if (direction === 'right') {
            this.intro = this.intro + content;
        }
    }

    edit(content, storeName, contentOnly) {
        this.content = content;
        if (!contentOnly) {
            this.intro = '';
            this.outro = '';
        }
        this.storeName = storeName;
        this.edited = true;
        return this;
    }

    split(index) {
        const sliceIndex = index - this.start;
        const newContent = this.original.slice(sliceIndex);
        const newChunk = new Chunk(index, this.end, newContent);
        newChunk.outro = this.outro;
        this.original = this.original.slice(0, sliceIndex);
        this.outro = '';
        this.end = index;
        this.content = newChunk.content = this.edited ? '' : this.original;
        if (this.next) this.next.previous = newChunk;
        newChunk.next = this.next;
        newChunk.previous = this;
        this.next = newChunk;
        return newChunk;
    }

    toString() {
        return this.intro + this.content + this.outro;
    }
}

class MagicString {
    constructor(string) {
        this.original = string;
        this.intro = '';
        this.outro = '';
        const chunk = new Chunk(0, string.length, string);
        this.firstChunk = this.lastChunk = this.lastSearchedChunk = chunk;
        this.byStart = { 0: chunk };
        this.byEnd = { [string.length]: chunk };
        this.sourcemapLocations = new BitSet();
        this.storedNames = {};
    }

    append(content, direction = 'right') {
        if (typeof content !== 'string') throw new TypeError('content must be a string');
        direction === 'left' ? this.intro += content : this.outro += content;
        return this;
    }

    clone() {
        const cloned = new MagicString(this.original);
        let originalChunk = this.firstChunk;
        let clonedChunk = (cloned.firstChunk = originalChunk.clone());
        while (originalChunk) {
            cloned.byStart[clonedChunk.start] = clonedChunk;
            cloned.byEnd[clonedChunk.end] = clonedChunk;
            originalChunk = originalChunk.next;
            if (originalChunk) {
                const nextClonedChunk = originalChunk.clone();
                clonedChunk.next = nextClonedChunk;
                nextClonedChunk.previous = clonedChunk;
                clonedChunk = nextClonedChunk;
            }
        }
        cloned.lastChunk = clonedChunk;
        cloned.sourcemapLocations = new BitSet(this.sourcemapLocations);
        cloned.intro = this.intro;
        cloned.outro = this.outro;
        return cloned;
    }

    generateDecodedMap() {
        const mappings = [];
        this.firstChunk.eachNext((chunk) => {
            const segment = [chunk.start, chunk.start];
            if (chunk.edited) {
                segment[2] = chunk.content;
            }
            mappings.push(segment);
        });
        return {
            version: 3,
            sources: ['source'],
            names: [],
            mappings: sourcemapCodec.encode(mappings),
            sourcesContent: [this.original],
        };
    }

    generateMap() {
        return JSON.stringify(this.generateDecodedMap());
    }

    overwrite(start, end, content) {
        this._split(start);
        this._split(end);
        this.byStart[start].edit(content, true);
        let chunk = this.byStart[start].next;
        while (chunk && chunk.start < end) {
            chunk.edit('', false);
            chunk = chunk.next;
        }
        return this;
    }

    remove(start, end) {
        this.overwrite(start, end, '');
        return this;
    }

    _split(index) {
        if (this.byStart[index] || this.byEnd[index]) return;
        let chunk = this.lastSearchedChunk;
        const searchForward = index > chunk.end;
        while (chunk) {
            if (chunk.contains(index)) return this._splitChunk(chunk, index);
            chunk = searchForward ? chunk.next : chunk.previous;
        }
    }

    _splitChunk(chunk, index) {
        const newChunk = chunk.split(index);
        this.byEnd[index] = chunk;
        this.byStart[index] = newChunk;
        this.byEnd[newChunk.end] = newChunk;
        if (chunk === this.lastChunk) this.lastChunk = newChunk;
        this.lastSearchedChunk = chunk;
        return true;
    }

    toString() {
        let str = this.intro;
        let chunk = this.firstChunk;
        while (chunk) {
            str += chunk.toString();
            chunk = chunk.next;
        }
        return str + this.outro;
    }
}

module.exports = MagicString;
