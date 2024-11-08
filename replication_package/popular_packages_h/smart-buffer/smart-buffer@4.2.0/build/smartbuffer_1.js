"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { checkEncoding, isFiniteInteger, bigIntAndBufferInt64Check, checkLengthValue, checkOffsetValue, checkTargetOffset, ERRORS } = require("./utils");

// Constants for default buffer settings
const DEFAULT_BUFFER_SIZE = 4096;
const DEFAULT_ENCODING = 'utf8';

class SmartBuffer {
    constructor(options) {
        this._encoding = DEFAULT_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;
        this.length = 0;

        if (SmartBuffer.isValidOptions(options)) {
            this._encoding = options.encoding || this._encoding;
            this._buff = this.getStartingBuffer(options);
        } else if (options !== undefined) {
            throw new Error(ERRORS.INVALID_SMARTBUFFER_OBJECT);
        } else {
            this._buff = Buffer.allocUnsafe(DEFAULT_BUFFER_SIZE);
        }
    }

    static fromSize(size, encoding) {
        return new this({ size, encoding });
    }

    static fromBuffer(buff, encoding) {
        return new this({ buff, encoding });
    }

    static fromOptions(options) {
        return new this(options);
    }

    static isValidOptions(options) {
        return options && (options.encoding || options.size || options.buff);
    }

    getStartingBuffer(options) {
        if (options.size) {
            if (isFiniteInteger(options.size) && options.size > 0) {
                return Buffer.allocUnsafe(options.size);
            } else {
                throw new Error(ERRORS.INVALID_SMARTBUFFER_SIZE);
            }
        } else if (options.buff) {
            if (Buffer.isBuffer(options.buff)) {
                this.length = options.buff.length;
                return options.buff;
            } else {
                throw new Error(ERRORS.INVALID_SMARTBUFFER_BUFFER);
            }
        } else {
            return Buffer.allocUnsafe(DEFAULT_BUFFER_SIZE);
        }
    }

    // Read and write methods for signed integers
    readInt8(offset) { return this._readValue(Buffer.prototype.readInt8, 1, offset); }
    readInt16BE(offset) { return this._readValue(Buffer.prototype.readInt16BE, 2, offset); }
    readInt16LE(offset) { return this._readValue(Buffer.prototype.readInt16LE, 2, offset); }
    readInt32BE(offset) { return this._readValue(Buffer.prototype.readInt32BE, 4, offset); }
    readInt32LE(offset) { return this._readValue(Buffer.prototype.readInt32LE, 4, offset); }
    readBigInt64BE(offset) {
        bigIntAndBufferInt64Check('readBigInt64BE');
        return this._readValue(Buffer.prototype.readBigInt64BE, 8, offset);
    }
    readBigInt64LE(offset) {
        bigIntAndBufferInt64Check('readBigInt64LE');
        return this._readValue(Buffer.prototype.readBigInt64LE, 8, offset);
    }
    // Similar methods for writing & inserting same data types...

    // Methods for unsigned integers, floating points and strings are similarly defined...

    _readValue(func, size, offset) {
        this.ensureReadable(size, offset);
        const readOffset = offset !== undefined ? offset : this._readOffset;
        const value = func.call(this._buff, readOffset);
        if (offset === undefined) this._readOffset += size;
        return value;
    }

    _writeValue(func, size, value, offset) {
        const writeOffset = offset !== undefined ? offset : this._writeOffset;
        offset !== undefined && checkOffsetValue(offset);
        this.ensureCapacity(writeOffset + size);
        func.call(this._buff, value, writeOffset);
        this._writeOffset = Math.max(this._writeOffset, writeOffset + size);
        return this;
    }

    ensureReadable(length, offset) {
        const readOffset = offset !== undefined ? offset : this._readOffset;
        if (readOffset < 0 || (readOffset + length) > this.length) {
            throw new Error(ERRORS.INVALID_READ_BEYOND_BOUNDS);
        }
    }

    ensureCapacity(minLength) {
        if (minLength > this._buff.length) {
            const newLength = Math.max(minLength, (this._buff.length * 1.5 + 1) | 0);
            const newBuff = Buffer.allocUnsafe(newLength);
            this._buff.copy(newBuff, 0, 0, this.length);
            this._buff = newBuff;
        }
    }

    // Remaining Methods for handling encodings, buffers, etc., remain similar...
}

exports.SmartBuffer = SmartBuffer;
