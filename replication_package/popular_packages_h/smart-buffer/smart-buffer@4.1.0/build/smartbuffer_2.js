"use strict";
const { checkEncoding, isFiniteInteger, bigIntAndBufferInt64Check, checkOffsetValue, checkLengthValue, ERRORS, checkTargetOffset } = require("./utils");

const DEFAULT_SIZE = 4096;
const DEFAULT_ENCODING = 'utf8';

class SmartBuffer {
    constructor(options) {
        this.length = 0;
        this._encoding = DEFAULT_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;

        if (SmartBuffer.isOptions(options)) {
            this._encoding = options.encoding || this._encoding;
            const size = options.size || DEFAULT_SIZE;
            this._buff = options.buff instanceof Buffer ? options.buff : Buffer.allocUnsafe(size);
            this.length = this._buff.length;
        } else if (options) {
            throw new Error(ERRORS.INVALID_SMARTBUFFER_OBJECT);
        } else {
            this._buff = Buffer.allocUnsafe(DEFAULT_SIZE);
        }
    }

    static fromSize(size, encoding) {
        return new SmartBuffer({ size, encoding });
    }

    static fromBuffer(buff, encoding) {
        return new SmartBuffer({ buff, encoding });
    }

    static fromOptions(options) {
        return new SmartBuffer(options);
    }

    static isOptions(options) {
        return options && ('encoding' in options || 'size' in options || 'buff' in options);
    }

    readInt8(offset) {
        return this._read(Buffer.prototype.readInt8, 1, offset);
    }

    readInt16BE(offset) {
        return this._read(Buffer.prototype.readInt16BE, 2, offset);
    }

    readInt16LE(offset) {
        return this._read(Buffer.prototype.readInt16LE, 2, offset);
    }

    readInt32BE(offset) {
        return this._read(Buffer.prototype.readInt32BE, 4, offset);
    }

    readInt32LE(offset) {
        return this._read(Buffer.prototype.readInt32LE, 4, offset);
    }

    writeInt8(value, offset) {
        return this._write(Buffer.prototype.writeInt8, 1, value, offset);
    }

    writeInt16BE(value, offset) {
        return this._write(Buffer.prototype.writeInt16BE, 2, value, offset);
    }

    writeInt16LE(value, offset) {
        return this._write(Buffer.prototype.writeInt16LE, 2, value, offset);
    }

    writeInt32BE(value, offset) {
        return this._write(Buffer.prototype.writeInt32BE, 4, value, offset);
    }

    writeInt32LE(value, offset) {
        return this._write(Buffer.prototype.writeInt32LE, 4, value, offset);
    }

    _read(func, byteSize, offset) {
        this._ensureRead(byteSize, offset);
        const val = func.call(this._buff, offset ?? this._readOffset);
        if (offset === undefined) this._readOffset += byteSize;
        return val;
    }

    _write(func, byteSize, value, offset) {
        const writeOffset = offset ?? this._writeOffset;
        this._ensureCapacity(writeOffset + byteSize);
        func.call(this._buff, value, writeOffset);
        this._writeOffset = Math.max(this._writeOffset, writeOffset + byteSize);
        return this;
    }

    _ensureRead(length, offset) {
        const readOffset = offset ?? this._readOffset;
        if (readOffset < 0 || (readOffset + length) > this.length) {
            throw new Error(ERRORS.INVALID_READ_BEYOND_BOUNDS);
        }
    }

    _ensureCapacity(length) {
        if (length > this._buff.length) {
            const newBuffer = Buffer.allocUnsafe(Math.max(length, (this._buff.length * 3) / 2 + 1));
            this._buff.copy(newBuffer, 0, 0, this.length);
            this._buff = newBuffer;
        }
    }
}

exports.SmartBuffer = SmartBuffer;
