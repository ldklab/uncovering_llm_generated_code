"use strict";
const { EventEmitter } = require('node:events');
const Stream = require('node:stream');
const { StringDecoder } = require('node:string_decoder');

const isStream = (s) => !!s && (s instanceof Minipass || s instanceof Stream || isReadable(s) || isWritable(s));
const isReadable = (s) => !!s && s instanceof EventEmitter && typeof s.pipe === 'function' && s.pipe !== Stream.Writable.prototype.pipe;
const isWritable = (s) => !!s && s instanceof EventEmitter && typeof s.write === 'function' && typeof s.end === 'function';

class Minipass extends EventEmitter {
    constructor(options = {}) {
        super();
        this.objectMode = options.objectMode || false;
        this.encoding = options.objectMode ? null : options.encoding || null;
        this.async = !!options.async;
        this.decoder = this.encoding ? new StringDecoder(this.encoding) : null;
        this.buffer = [];
        this.flowing = false;
        this.paused = false;
        this.bufferLength = 0;
        this.eof = false;
        this.emittedEnd = false;
    }

    write(chunk, encoding = 'utf8', callback) {
        if (this.eof) throw new Error('Write after end');
        if (typeof encoding === 'function') [callback, encoding] = [encoding, 'utf8'];
        const data = this.objectMode ? chunk : Buffer.from(chunk, encoding);
        this.buffer.push(data);
        this.bufferLength += this.objectMode ? 1 : Buffer.byteLength(data);
        if (this.flowing) this.emit('data', data);
        if (callback) process.nextTick(callback);
        return this.flowing;
    }

    read(n) {
        if (this.bufferLength === 0 || n === 0) return null;
        const chunk = this.buffer.shift();
        this.bufferLength -= this.objectMode ? 1 : Buffer.byteLength(chunk);
        this.emit('data', chunk);
        return chunk;
    }

    end(chunk, encoding = 'utf8', callback) {
        if (typeof chunk === 'function') [callback, chunk] = [chunk, undefined];
        if (chunk !== undefined) this.write(chunk, encoding);
        this.eof = true;
        process.nextTick(() => {
            if (!this.emittedEnd) {
                this.emittedEnd = true;
                this.emit('end');
            }
        });
        if (callback) this.once('end', callback);
    }

    pipe(dest, { end = true } = {}) {
        this.on('data', (chunk) => {
            if (dest.write(chunk) === false) this.pause();
        });
        if (end) this.once('end', () => dest.end());
        return dest;
    }

    unpipe(dest) {
        this.removeListener('data', (chunk) => dest.write(chunk));
    }

    pause() {
        this.flowing = false;
    }

    resume() {
        if (!this.flowing) {
            this.flowing = true;
            this.emit('resume');
            while (this.buffer.length) {
                const chunk = this.read();
                if (!chunk) break;
            }
            if (this.eof && this.bufferLength === 0) {
                this.emit('end');
            }
        }
    }

    collect() {
        return new Promise((resolve) => {
            const data = [];
            this.on('data', chunk => data.push(chunk));
            this.once('end', () => resolve(data));
        });
    }

    async concat() {
        const data = await this.collect();
        return this.encoding ? Buffer.concat(data).toString(this.encoding) : Buffer.concat(data);
    }
}

exports.Minipass = Minipass;
exports.isStream = isStream;
exports.isReadable = isReadable;
exports.isWritable = isWritable;
