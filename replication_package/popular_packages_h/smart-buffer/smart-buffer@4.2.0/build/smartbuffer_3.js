"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./utils");

const DEFAULT_BUFFER_SIZE = 4096;
const DEFAULT_ENCODING = 'utf8';

class SmartBuffer {
    constructor(options = {}) {
        this._encoding = options.encoding || DEFAULT_ENCODING;
        this._buff = options.buff && Buffer.isBuffer(options.buff) ? options.buff : Buffer.allocUnsafe(options.size || DEFAULT_BUFFER_SIZE);
        this.length = this._buff.length;
        this._writeOffset = this._readOffset = 0;

        if (options.size && !utils.isFiniteInteger(options.size)) {
            throw new Error(utils.ERRORS.INVALID_SMARTBUFFER_SIZE);
        }
        if (options.encoding) utils.checkEncoding(options.encoding);
    }

    static fromSize(size, encoding) {
        return new this({ size, encoding });
    }

    static fromBuffer(buff, encoding) {
        return new this({ buff, encoding });
    }

    static isSmartBufferOptions(options) {
        return options && (options.encoding || options.size || options.buff);
    }

    readInt8(offset) {
        return this._readNumber(Buffer.prototype.readInt8, 1, offset);
    }

    writeInt8(value, offset) {
        this._writeNumber(Buffer.prototype.writeInt8, 1, value, offset);
        return this;
    }

    readUInt8(offset) {
        return this._readNumber(Buffer.prototype.readUInt8, 1, offset);
    }

    writeUInt8(value, offset) {
        this._writeNumber(Buffer.prototype.writeUInt8, 1, value, offset);
        return this;
    }

    readFloatBE(offset) {
        return this._readNumber(Buffer.prototype.readFloatBE, 4, offset);
    }

    writeFloatBE(value, offset) {
        this._writeNumber(Buffer.prototype.writeFloatBE, 4, value, offset);
        return this;
    }

    readString(length, encoding) {
        const actualLength = Math.min(this.length - this._readOffset, length || this.length);
        const str = this._buff.toString(encoding || this._encoding, this._readOffset, this._readOffset + actualLength);
        this._readOffset += actualLength;
        return str;
    }

    writeString(value, offset, encoding) {
        const length = Buffer.byteLength(value, encoding || this._encoding);
        this.ensureCapacity(length + (offset === undefined ? this._writeOffset : offset));
        this._buff.write(value, offset === undefined ? this._writeOffset : offset, length, encoding || this._encoding);
        this._writeOffset = Math.max(this._writeOffset, length + (offset || this._writeOffset));
        return this;
    }

    ensureCapacity(minCapacity) {
        if (minCapacity > this._buff.length) {
            const newBuffer = Buffer.allocUnsafe((this._buff.length * 3) / 2 + 1);
            this._buff.copy(newBuffer);
            this._buff = newBuffer;
        }
    }

    _readNumber(func, byteSize, offset) {
        const realOffset = offset !== undefined ? offset : this._readOffset;
        const value = func.call(this._buff, realOffset);
        if (offset === undefined) this._readOffset += byteSize;
        return value;
    }

    _writeNumber(func, byteSize, value, offset) {
        const realOffset = offset !== undefined ? offset : this._writeOffset;
        this.ensureCapacity(realOffset + byteSize);
        func.call(this._buff, value, realOffset);
        this._writeOffset = Math.max(this._writeOffset, realOffset + byteSize);
    }
}
exports.SmartBuffer = SmartBuffer;
