"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");

const DEFAULT_SMARTBUFFER_SIZE = 4096;
const DEFAULT_SMARTBUFFER_ENCODING = 'utf8';

class SmartBuffer {
    constructor(options) {
        this.length = 0;
        this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;
        
        if (SmartBuffer.isSmartBufferOptions(options)) {
            this._encoding = options.encoding || DEFAULT_SMARTBUFFER_ENCODING;
            this._setInitialBuffer(options);
        } else {
            throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_OBJECT);
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

    readInt8(offset) {
        return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
    }

    writeInt8(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    }

    insertInt8(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    }

    _setInitialBuffer(options) {
        if (options.size) {
            this._ensureValidSize(options.size);
            this._buff = Buffer.allocUnsafe(options.size);
        } else if (options.buff) {
            this._ensureValidBuffer(options.buff);
            this._buff = options.buff;
            this.length = options.buff.length;
        } else {
            this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
        }
    }

    _ensureValidSize(size) {
        if (!utils_1.isFiniteInteger(size) || size <= 0) {
            throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_SIZE);
        }
    }
    
    _ensureValidBuffer(buff) {
        if (!(buff instanceof Buffer)) {
            throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_BUFFER);
        }
    }

    _readNumberValue(func, byteSize, offset) {
        this.ensureReadable(byteSize, offset);
        const value = func.call(this._buff, offset || this._readOffset);
        if (offset === undefined) this._readOffset += byteSize;
        return value;
    }

    _writeNumberValue(func, byteSize, value, offset) {
        const offsetVal = offset !== undefined ? offset : this._writeOffset;
        this._ensureWriteable(byteSize, offsetVal);
        func.call(this._buff, value, offsetVal);
        if (offset !== undefined) this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
        else this._writeOffset += byteSize;
        return this;
    }

    _insertNumberValue(func, byteSize, value, offset) {
        utils_1.checkOffsetValue(offset);
        this.ensureInsertable(byteSize, offset);
        func.call(this._buff, value, offset);
        this._writeOffset += byteSize;
        return this;
    }

    ensureReadable(length, offset) {
        const offsetVal = offset || this._readOffset;
        if (offsetVal < 0 || offsetVal + length > this.length) {
            throw new Error(utils_1.ERRORS.INVALID_READ_BEYOND_BOUNDS);
        }
    }

    ensureInsertable(dataLength, offset) {
        utils_1.checkOffsetValue(offset);
        this._ensureCapacity(this.length + dataLength);
        if (offset < this.length) {
            this._buff.copy(this._buff, offset + dataLength, offset);
        }
        this.length = Math.max(offset + dataLength, this.length);
    }

    _ensureWriteable(dataLength, offset) {
        const offsetVal = offset || this._writeOffset;
        this._ensureCapacity(offsetVal + dataLength);
        this.length = Math.max(offsetVal + dataLength, this.length);
    }

    _ensureCapacity(minLength) {
        const oldLength = this._buff.length;
        if (minLength > oldLength) {
            const newLength = Math.max((oldLength * 1.5) + 1, minLength);
            const newBuff = Buffer.allocUnsafe(newLength);
            this._buff.copy(newBuff, 0, 0, oldLength);
            this._buff = newBuff;
        }
    }
}

exports.SmartBuffer = SmartBuffer;
