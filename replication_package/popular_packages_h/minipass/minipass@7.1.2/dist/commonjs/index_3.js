"use strict";

const { EventEmitter } = require("node:events");
const Stream = require("node:stream");
const StringDecoder = require("node:string_decoder").StringDecoder;

const proc = typeof process === 'object' && process ? process : { stdout: null, stderr: null };

const EOF = Symbol('EOF');
const DESTROYED = Symbol('destroyed');
const EMITTED_END = Symbol('emittedEnd');
const BUFFERLENGTH = Symbol('bufferLength');
const BUFFER = Symbol('buffer');
const ENCODING = Symbol('encoding');

class Minipass extends EventEmitter {
    constructor({ objectMode = false, encoding = null } = {}) {
        super();
        this.objectMode = objectMode;
        this[ENCODING] = encoding || null;
        this.buffer = [];
        this[BUFFERLENGTH] = 0;
        this[EMITTED_END] = false;
        this[DESTROYED] = false;
    }

    write(chunk, encoding = 'utf8') {
        if (this[DESTROYED]) throw new Error('cannot write after stream destroyed');
        if (!this.objectMode && typeof chunk === 'string') {
            chunk = Buffer.from(chunk, encoding);
        }
        this.buffer.push(chunk);
        this[BUFFERLENGTH] += chunk.length;
        this.emit('data', chunk);
        return true;
    }

    end(chunk, encoding) {
        if (chunk !== undefined) this.write(chunk, encoding);
        this.emit('end');
        this[EMITTED_END] = true;
    }

    pipe(destination, options = {}) {
        const end = options.end !== false;
        this.on('data', (chunk) => {
            if (destination.write(chunk) === false) this.pause();
        });
        if (end) this.on('end', () => destination.end());
        return destination;
    }

    pause() {
        this.emit('pause');
    }

    resume() {
        this.emit('resume');
    }

    destroy(err) {
        if (this[DESTROYED]) return;
        this[DESTROYED] = true;
        if (err) this.emit('error', err);
        this.emit('close');
    }
}

const isStream = (obj) => obj instanceof Stream || (obj && typeof obj === 'object' && 
    (obj instanceof Minipass || typeof obj.read === 'function' || typeof obj.write === 'function'));

const isReadable = (obj) => !!obj && typeof obj === 'object' && typeof obj.read === 'function';

const isWritable = (obj) => !!obj && typeof obj === 'object' && typeof obj.write === 'function';

exports.Minipass = Minipass;
exports.isStream = isStream;
exports.isReadable = isReadable;
exports.isWritable = isWritable;
