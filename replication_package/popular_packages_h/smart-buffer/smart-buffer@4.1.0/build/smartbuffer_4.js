"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");

const DEFAULT_SIZE = 4096;
const DEFAULT_ENCODING = 'utf8';

class SmartBuffer {
    constructor(options) {
        this.length = 0;
        this._encoding = DEFAULT_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;

        if (SmartBuffer.isOptions(options)) {
            if (options.encoding) {
                utils_1.checkEncoding(options.encoding);
                this._encoding = options.encoding;
            }
            if (options.size) {
                if (utils_1.isFiniteInteger(options.size) && options.size > 0) {
                    this._buff = Buffer.allocUnsafe(options.size);
                } else {
                    throw new Error(utils_1.ERRORS.INVALID_BUFFER_SIZE);
                }
            } else if (options.buff) {
                if (options.buff instanceof Buffer) {
                    this._buff = options.buff;
                    this.length = options.buff.length;
                } else {
                    throw new Error(utils_1.ERRORS.INVALID_BUFFER);
                }
            } else {
                this._buff = Buffer.allocUnsafe(DEFAULT_SIZE);
            }
        } else {
            if (typeof options !== 'undefined') {
                throw new Error(utils_1.ERRORS.INVALID_OBJECT);
            }
            this._buff = Buffer.allocUnsafe(DEFAULT_SIZE);
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

    static isOptions(options) {
        const opt = options;
        return (opt && (opt.encoding !== undefined || opt.size !== undefined || opt.buff !== undefined));
    }

    // Read/Write Methods for Various Data Types
    read(offset, byteSize, func) {
        this.ensureReadable(byteSize, offset);
        const value = func.call(this._buff, typeof offset === 'number' ? offset : this._readOffset);
        if (typeof offset === 'undefined') {
            this._readOffset += byteSize;
        }
        return value;
    }

    write(value, byteSize, func, offset) {
        if (typeof offset === 'number') {
            utils_1.checkOffsetValue(offset);
            if (offset < 0) {
                throw new Error(utils_1.ERRORS.INVALID_WRITE_BEYOND_BOUNDS);
            }
        }
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        this.ensureWritable(byteSize, offsetVal);
        func.call(this._buff, value, offsetVal);
        if (typeof offset === 'number') {
            this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
        } else {
            this._writeOffset += byteSize;
        }
        return this;
    }

    // Methods for String Handling
    handleString(value, isInsert, arg2, encoding) {
        let offset = this._writeOffset, enc = this._encoding;
        if (typeof arg2 === 'number') {
            offset = arg2;
        } else if (typeof arg2 === 'string') {
            utils_1.checkEncoding(arg2);
            enc = arg2;
        }
        if (typeof encoding === 'string') {
            utils_1.checkEncoding(encoding);
            enc = encoding;
        }
        const byteLength = Buffer.byteLength(value, enc);
        if (isInsert) {
            this.ensureInsertable(byteLength, offset);
        } else {
            this.ensureWritable(byteLength, offset);
        }
        this._buff.write(value, offset, byteLength, enc);
        this._writeOffset = isInsert ? this._writeOffset + byteLength : Math.max(this._writeOffset, offset + byteLength);
        return this;
    }

    // Capacity and Bound Check Methods
    ensureReadable(length, offset) {
        let offsetVal = this._readOffset;
        if (typeof offset !== 'undefined') {
            utils_1.checkOffsetValue(offset);
            offsetVal = offset;
        }
        if (offsetVal < 0 || offsetVal + length > this.length) {
            throw new Error(utils_1.ERRORS.INVALID_READ_BEYOND_BOUNDS);
        }
    }

    ensureWritable(length, offset) {
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        this.ensureCapacity(offsetVal + length);
        if (offsetVal + length > this.length) {
            this.length = offsetVal + length;
        }
    }

    ensureInsertable(dataLength, offset) {
        utils_1.checkOffsetValue(offset);
        this.ensureCapacity(this.length + dataLength);
        if (offset < this.length) {
            this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
        }
        this.length = offset + dataLength > this.length ? offset + dataLength : this.length + dataLength;
    }

    ensureCapacity(minLength) {
        const oldLength = this._buff.length;
        if (minLength > oldLength) {
            const data = this._buff;
            let newLength = (oldLength * 3) / 2 + 1;
            if (newLength < minLength) {
                newLength = minLength;
            }
            this._buff = Buffer.allocUnsafe(newLength);
            data.copy(this._buff, 0, 0, oldLength);
        }
    }

    // Clear and Destroy
    clear() {
        this._writeOffset = 0;
        this._readOffset = 0;
        this.length = 0;
        return this;
    }

    destroy() {
        this.clear();
        return this;
    }

    // Getters and Setters for Offsets and Encoding
    get readOffset() {
        return this._readOffset;
    }

    set readOffset(offset) {
        utils_1.checkOffsetValue(offset);
        utils_1.checkTargetOffset(offset, this);
        this._readOffset = offset;
    }

    get writeOffset() {
        return this._writeOffset;
    }

    set writeOffset(offset) {
        utils_1.checkOffsetValue(offset);
        utils_1.checkTargetOffset(offset, this);
        this._writeOffset = offset;
    }

    get encoding() {
        return this._encoding;
    }

    set encoding(encoding) {
        utils_1.checkEncoding(encoding);
        this._encoding = encoding;
    }

    get internalBuffer() {
        return this._buff;
    }

    toBuffer() {
        return this._buff.slice(0, this.length);
    }

    toString(encoding) {
        const enc = typeof encoding === 'string' ? encoding : this._encoding;
        utils_1.checkEncoding(enc);
        return this._buff.toString(enc, 0, this.length);
    }
}

exports.SmartBuffer = SmartBuffer;
