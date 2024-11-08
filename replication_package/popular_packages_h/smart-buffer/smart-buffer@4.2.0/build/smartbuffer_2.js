"use strict";
const { checkEncoding, isFiniteInteger, bigIntAndBufferInt64Check, ERRORS, checkOffsetValue, checkTargetOffset, checkLengthValue } = require("./utils");

const DEFAULT_SMARTBUFFER_SIZE = 4096;
const DEFAULT_SMARTBUFFER_ENCODING = "utf8";

class SmartBuffer {
    constructor(options) {
        this.length = 0;
        this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;
        this._buff = this._initializeBuffer(options);
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
        const castOptions = options;
        return (
            castOptions &&
            (castOptions.encoding !== undefined || castOptions.size !== undefined || castOptions.buff !== undefined)
        );
    }

    readInt8(offset) {
        return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
    }
    
    // Other integer, float, and double read/write methods following a similar pattern

    writeInt8(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    }
    
    // Other string, buffer, insert methods following a similar pattern
    
    readString(arg1, encoding) {
        let lengthVal = typeof arg1 === "number" ? Math.min(arg1, this.length - this._readOffset) : this.length - this._readOffset;
        encoding = typeof arg1 === "string" ? arg1 : encoding;
        checkEncoding(encoding);
        const value = this._buff.slice(this._readOffset, this._readOffset + lengthVal).toString(encoding || this._encoding);
        this._readOffset += lengthVal;
        return value;
    }
    
    // Similar methods for reading/writing buffers and null-terminated strings

    _initializeBuffer(options) {
        if (SmartBuffer.isSmartBufferOptions(options)) {
            return this._createBufferFromOptions(options);
        } else if (typeof options !== "undefined") {
            throw new Error(ERRORS.INVALID_SMARTBUFFER_OBJECT);
        }
        return Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
    }

    _createBufferFromOptions(options) {
        if (options.encoding) {
            checkEncoding(options.encoding);
            this._encoding = options.encoding;
        }
        if (options.size) {
            if (isFiniteInteger(options.size) && options.size > 0) {
                return Buffer.allocUnsafe(options.size);
            }
            throw new Error(ERRORS.INVALID_SMARTBUFFER_SIZE);
        } else if (options.buff) {
            if (Buffer.isBuffer(options.buff)) {
                this.length = options.buff.length;
                return options.buff;
            }
            throw new Error(ERRORS.INVALID_SMARTBUFFER_BUFFER);
        }
        return Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
    }

    _readNumberValue(func, byteSize, offset) {
        this.ensureReadable(byteSize, offset);
        const value = func.call(this._buff, offset === undefined ? this._readOffset : offset);
        if (offset === undefined) this._readOffset += byteSize;
        return value;
    }

    _writeNumberValue(func, byteSize, value, offset) {
        const offsetVal = typeof offset === "number" ? offset : this._writeOffset;
        this._ensureWriteable(byteSize, offsetVal);
        func.call(this._buff, value, offsetVal);
        this._writeOffset = typeof offset === "number" ? Math.max(this._writeOffset, offsetVal + byteSize) : this._writeOffset + byteSize;
        return this;
    }

    // Methods to handle buffer management and capacity: ensureReadable, _ensureWriteable, etc.
}

exports.SmartBuffer = SmartBuffer;
