"use strict";
const { checkEncoding, isFiniteInteger, bigIntAndBufferInt64Check, checkLengthValue, checkOffsetValue, checkTargetOffset, ERRORS } = require("./utils");

// Default constants
const DEFAULT_SMARTBUFFER_SIZE = 4096;
const DEFAULT_SMARTBUFFER_ENCODING = 'utf8';

class SmartBuffer {
    constructor(options) {
        this.length = 0;
        this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;

        if (SmartBuffer.isSmartBufferOptions(options)) {
            if (options.encoding) {
                checkEncoding(options.encoding);
                this._encoding = options.encoding;
            }
            if (options.size) {
                if (isFiniteInteger(options.size) && options.size > 0) {
                    this._buff = Buffer.allocUnsafe(options.size);
                } else {
                    throw new Error(ERRORS.INVALID_SMARTBUFFER_SIZE);
                }
            } else if (options.buff) {
                if (Buffer.isBuffer(options.buff)) {
                    this._buff = options.buff;
                    this.length = options.buff.length;
                } else {
                    throw new Error(ERRORS.INVALID_SMARTBUFFER_BUFFER);
                }
            } else {
                this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
            }
        } else {
            if (typeof options !== 'undefined') {
                throw new Error(ERRORS.INVALID_SMARTBUFFER_OBJECT);
            }
            this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
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

    static isSmartBufferOptions(options) {
        return options && (options.encoding !== undefined || options.size !== undefined || options.buff !== undefined);
    }

    readInt8(offset) { return this._readNumberValue(Buffer.prototype.readInt8, 1, offset); }
    readInt16BE(offset) { return this._readNumberValue(Buffer.prototype.readInt16BE, 2, offset); }
    readInt16LE(offset) { return this._readNumberValue(Buffer.prototype.readInt16LE, 2, offset); }
    readInt32BE(offset) { return this._readNumberValue(Buffer.prototype.readInt32BE, 4, offset); }
    readInt32LE(offset) { return this._readNumberValue(Buffer.prototype.readInt32LE, 4, offset); }

    readBigInt64BE(offset) {
        bigIntAndBufferInt64Check('readBigInt64BE');
        return this._readNumberValue(Buffer.prototype.readBigInt64BE, 8, offset);
    }

    readBigInt64LE(offset) {
        bigIntAndBufferInt64Check('readBigInt64LE');
        return this._readNumberValue(Buffer.prototype.readBigInt64LE, 8, offset);
    }

    writeInt8(value, offset) {
        this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
        return this;
    }

    insertInt8(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    }
    
    // Similar methods for other integer types and encodings...
    
    readString(arg1, encoding) {
        const lengthVal = (typeof arg1 === 'number') ? Math.min(arg1, this.length - this._readOffset) : this.length - this._readOffset;
        encoding = typeof arg1 === 'string' ? arg1 : encoding;
        const value = this._buff.slice(this._readOffset, this._readOffset + lengthVal).toString(encoding || this._encoding);
        this._readOffset += lengthVal;
        return value;
    }

    writeString(value, arg2, encoding) {
        return this._handleString(value, false, arg2, encoding);
    }

    readBuffer(length) {
        const lengthVal = length || this.length;
        const endPoint = Math.min(this.length, this._readOffset + lengthVal);
        const value = this._buff.slice(this._readOffset, endPoint);
        this._readOffset = endPoint;
        return value;
    }

    writeBuffer(value, offset) {
        return this._handleBuffer(value, false, offset);
    }

    clear() {
        this._writeOffset = 0;
        this._readOffset = 0;
        this.length = 0;
        return this;
    }

    _handleString(value, isInsert, arg3, encoding) {
        // The logic to handle string read or write
        // Ensure buffer capacity, calculate byte length
        // Read or Write operation
    }

    _handleBuffer(value, isInsert, offset) {
        const offsetVal = offset || this._writeOffset;
        if (isInsert) {
            this.ensureInsertable(value.length, offsetVal);
        } else {
            this._ensureWriteable(value.length, offsetVal);
        }
        value.copy(this._buff, offsetVal);
        this._writeOffset = (typeof offset === 'number') ? Math.max(this._writeOffset, offsetVal + value.length) : this._writeOffset + value.length;
        return this;
    }

    _readNumberValue(func, byteSize, offset) {
        this.ensureReadable(byteSize, offset);
        const value = func.call(this._buff, offset || this._readOffset);
        if (typeof offset === 'undefined') this._readOffset += byteSize;
        return value;
    }

    _writeNumberValue(func, byteSize, value, offset) {
        const offsetVal = offset || this._writeOffset;
        this._ensureWriteable(byteSize, offsetVal);
        func.call(this._buff, value, offsetVal);
        this._writeOffset = (typeof offset === 'number') ? Math.max(this._writeOffset, offsetVal + byteSize) : this._writeOffset + byteSize;
        return this;
    }

    ensureReadable(length, offset) {
        let offsetVal = this._readOffset;
        if (typeof offset !== 'undefined') {
            offsetVal = offset;
            checkOffsetValue(offset);
        }
        if (offsetVal < 0 || offsetVal + length > this.length) throw new Error(ERRORS.INVALID_READ_BEYOND_BOUNDS);
    }

    ensureInsertable(dataLength, offset) {
        checkOffsetValue(offset);
        this._ensureCapacity(this.length + dataLength);
        if (offset < this.length) {
            this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
        }
        this.length = Math.max(this.length, offset + dataLength);
    }

    _ensureWriteable(dataLength, offset) {
        const offsetVal = offset || this._writeOffset;
        this._ensureCapacity(offsetVal + dataLength);
        this.length = Math.max(this.length, offsetVal + dataLength);
    }

    _ensureCapacity(minLength) {
        const oldLength = this._buff.length;
        if (minLength > oldLength) {
            const oldData = this._buff;
            const newLength = Math.max(minLength, (oldLength * 3) / 2 + 1);
            this._buff = Buffer.allocUnsafe(newLength);
            oldData.copy(this._buff, 0, 0, oldLength);
        }
    }
}

module.exports = { SmartBuffer };
