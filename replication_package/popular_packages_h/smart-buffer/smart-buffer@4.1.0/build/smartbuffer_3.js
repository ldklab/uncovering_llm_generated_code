"use strict";

const { checkEncoding, isFiniteInteger, ERRORS, bigIntAndBufferInt64Check, checkLengthValue, checkOffsetValue, checkTargetOffset } = require("./utils");

const DEFAULT_BUFFER_SIZE = 4096;
const DEFAULT_ENCODING = 'utf8';

class SmartBuffer {
    constructor(options) {
        this.length = 0;
        this._encoding = DEFAULT_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;

        const opts = SmartBuffer.isSmartBufferOptions(options) ? options : {};
        
        if (opts.encoding) {
            checkEncoding(opts.encoding);
            this._encoding = opts.encoding;
        }

        if (opts.size) {
            if (isFiniteInteger(opts.size) && opts.size > 0) {
                this._buff = Buffer.allocUnsafe(opts.size);
            } else {
                throw new Error(ERRORS.INVALID_SMARTBUFFER_SIZE);
            }
        } else if (opts.buff instanceof Buffer) {
            this._buff = opts.buff;
            this.length = opts.buff.length;
        } else {
            this._buff = Buffer.allocUnsafe(DEFAULT_BUFFER_SIZE);
        }
        
        if (typeof options !== 'undefined' && !SmartBuffer.isSmartBufferOptions(options)) {
            throw new Error(ERRORS.INVALID_SMARTBUFFER_OBJECT);
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

    static isSmartBufferOptions(options) {
        return options && (options.encoding !== undefined || options.size !== undefined || options.buff instanceof Buffer);
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
    writeInt8(value, offset) { return this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset); }
    insertInt8(value, offset) { return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset); }
    writeInt16BE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset); }
    insertInt16BE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset); }
    writeInt16LE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset); }
    insertInt16LE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset); }
    writeInt32BE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset); }
    insertInt32BE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset); }
    writeInt32LE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset); }
    insertInt32LE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset); }
    writeBigInt64BE(value, offset) {
        bigIntAndBufferInt64Check('writeBigInt64BE');
        return this._writeNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
    }
    insertBigInt64BE(value, offset) {
        bigIntAndBufferInt64Check('writeBigInt64BE');
        return this._insertNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
    }
    writeBigInt64LE(value, offset) {
        bigIntAndBufferInt64Check('writeBigInt64LE');
        return this._writeNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
    }
    insertBigInt64LE(value, offset) {
        bigIntAndBufferInt64Check('writeBigInt64LE');
        return this._insertNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
    }
    readUInt8(offset) { return this._readNumberValue(Buffer.prototype.readUInt8, 1, offset); }
    readUInt16BE(offset) { return this._readNumberValue(Buffer.prototype.readUInt16BE, 2, offset); }
    readUInt16LE(offset) { return this._readNumberValue(Buffer.prototype.readUInt16LE, 2, offset); }
    readUInt32BE(offset) { return this._readNumberValue(Buffer.prototype.readUInt32BE, 4, offset); }
    readUInt32LE(offset) { return this._readNumberValue(Buffer.prototype.readUInt32LE, 4, offset); }
    readBigUInt64BE(offset) {
        bigIntAndBufferInt64Check('readBigUInt64BE');
        return this._readNumberValue(Buffer.prototype.readBigUInt64BE, 8, offset);
    }
    readBigUInt64LE(offset) {
        bigIntAndBufferInt64Check('readBigUInt64LE');
        return this._readNumberValue(Buffer.prototype.readBigUInt64LE, 8, offset);
    }
    writeUInt8(value, offset) { return this._writeNumberValue(Buffer.prototype.writeUInt8, 1, value, offset); }
    insertUInt8(value, offset) { return this._insertNumberValue(Buffer.prototype.writeUInt8, 1, value, offset); }
    writeUInt16BE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset); }
    insertUInt16BE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset); }
    writeUInt16LE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset); }
    insertUInt16LE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset); }
    writeUInt32BE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset); }
    insertUInt32BE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset); }
    writeUInt32LE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset); }
    insertUInt32LE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset); }
    writeBigUInt64BE(value, offset) {
        bigIntAndBufferInt64Check('writeBigUInt64BE');
        return this._writeNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
    }
    insertBigUInt64BE(value, offset) {
        bigIntAndBufferInt64Check('writeBigUInt64BE');
        return this._insertNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
    }
    writeBigUInt64LE(value, offset) {
        bigIntAndBufferInt64Check('writeBigUInt64LE');
        return this._writeNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
    }
    insertBigUInt64LE(value, offset) {
        bigIntAndBufferInt64Check('writeBigUInt64LE');
        return this._insertNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
    }
    readFloatBE(offset) { return this._readNumberValue(Buffer.prototype.readFloatBE, 4, offset); }
    readFloatLE(offset) { return this._readNumberValue(Buffer.prototype.readFloatLE, 4, offset); }
    writeFloatBE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset); }
    insertFloatBE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset); }
    writeFloatLE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset); }
    insertFloatLE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset); }
    readDoubleBE(offset) { return this._readNumberValue(Buffer.prototype.readDoubleBE, 8, offset); }
    readDoubleLE(offset) { return this._readNumberValue(Buffer.prototype.readDoubleLE, 8, offset); }
    writeDoubleBE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset); }
    insertDoubleBE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset); }
    writeDoubleLE(value, offset) { return this._writeNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset); }
    insertDoubleLE(value, offset) { return this._insertNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset); }

    readString(arg1, encoding) {
        let length = this.length - this._readOffset;
        if (typeof arg1 === 'number') {
            checkLengthValue(arg1);
            length = Math.min(arg1, length);
        } else if (typeof arg1 === 'string') {
            encoding = arg1;
        }

        if (typeof encoding !== 'undefined') {
            checkEncoding(encoding);
        }

        const value = this._buff.slice(this._readOffset, this._readOffset + length).toString(encoding || this._encoding);
        this._readOffset += length;
        return value;
    }

    insertString(value, offset, encoding) {
        checkOffsetValue(offset);
        return this._handleString(value, true, offset, encoding);
    }

    writeString(value, arg2, encoding) {
        return this._handleString(value, false, arg2, encoding);
    }

    readStringNT(encoding) {
        if (typeof encoding !== 'undefined') {
            checkEncoding(encoding);
        }

        let nullPos = this.length;
        for (let i = this._readOffset; i < this.length; i++) {
            if (this._buff[i] === 0x00) {
                nullPos = i;
                break;
            }
        }

        const value = this._buff.slice(this._readOffset, nullPos);
        this._readOffset = nullPos + 1;
        return value.toString(encoding || this._encoding);
    }

    insertStringNT(value, offset, encoding) {
        checkOffsetValue(offset);
        this.insertString(value, offset, encoding);
        this.insertUInt8(0x00, offset + Buffer.byteLength(value, encoding));
        return this;
    }

    writeStringNT(value, arg2, encoding) {
        this.writeString(value, arg2, encoding);
        this.writeUInt8(0x00, typeof arg2 === 'number' ? arg2 + Buffer.byteLength(value, encoding) : this.writeOffset);
        return this;
    }

    readBuffer(length) {
        if (typeof length !== 'undefined') {
            checkLengthValue(length);
        }
        const len = typeof length === 'number' ? length : this.length - this._readOffset;
        const value = this._buff.slice(this._readOffset, this._readOffset + len);
        this._readOffset += len;
        return value;
    }

    insertBuffer(value, offset) {
        checkOffsetValue(offset);
        return this._handleBuffer(value, true, offset);
    }

    writeBuffer(value, offset) {
        return this._handleBuffer(value, false, offset);
    }

    readBufferNT() {
        let nullPos = this.length;
        for (let i = this._readOffset; i < this.length; i++) {
            if (this._buff[i] === 0x00) {
                nullPos = i;
                break;
            }
        }
        const value = this._buff.slice(this._readOffset, nullPos);
        this._readOffset = nullPos + 1;
        return value;
    }

    insertBufferNT(value, offset) {
        checkOffsetValue(offset);
        this.insertBuffer(value, offset);
        this.insertUInt8(0x00, offset + value.length);
        return this;
    }

    writeBufferNT(value, offset) {
        if (typeof offset !== 'undefined') {
            checkOffsetValue(offset);
        }
        this.writeBuffer(value, offset);
        this.writeUInt8(0x00, typeof offset === 'number' ? offset + value.length : this.writeOffset);
        return this;
    }

    clear() {
        this._writeOffset = 0;
        this._readOffset = 0;
        this.length = 0;
        return this;
    }

    remaining() {
        return this.length - this._readOffset;
    }

    get readOffset() {
        return this._readOffset;
    }

    set readOffset(offset) {
        checkOffsetValue(offset);
        checkTargetOffset(offset, this);
        this._readOffset = offset;
    }

    get writeOffset() {
        return this._writeOffset;
    }

    set writeOffset(offset) {
        checkOffsetValue(offset);
        checkTargetOffset(offset, this);
        this._writeOffset = offset;
    }

    get encoding() {
        return this._encoding;
    }

    set encoding(encoding) {
        checkEncoding(encoding);
        this._encoding = encoding;
    }

    get internalBuffer() {
        return this._buff;
    }

    toBuffer() {
        return this._buff.slice(0, this.length);
    }

    toString(encoding) {
        const encodingToUse = encoding || this._encoding;
        checkEncoding(encodingToUse);
        return this._buff.toString(encodingToUse, 0, this.length);
    }

    destroy() {
        this.clear();
        return this;
    }

    _handleString(value, isInsert, arg3, encoding) {
        let offset = this._writeOffset;
        let enc = this._encoding;

        if (typeof arg3 === 'number') {
            offset = arg3;
        } else if (typeof arg3 === 'string') {
            checkEncoding(arg3);
            enc = arg3;
        }

        if (encoding) {
            checkEncoding(encoding);
            enc = encoding;
        }

        const byteLength = Buffer.byteLength(value, enc);
        if (isInsert) {
            this.ensureInsertable(byteLength, offset);
        } else {
            this._ensureWriteable(byteLength, offset);
        }

        this._buff.write(value, offset, byteLength, enc);

        if (!isInsert) {
            this._writeOffset = Math.max(this._writeOffset, offset + byteLength);
        } else {
            this._writeOffset += byteLength;
        }
        return this;
    }

    _handleBuffer(value, isInsert, offset) {
        const off = typeof offset === 'number' ? offset : this._writeOffset;
        if (isInsert) {
            this.ensureInsertable(value.length, off);
        } else {
            this._ensureWriteable(value.length, off);
        }

        value.copy(this._buff, off);
        if (!isInsert) { 
            this._writeOffset = Math.max(this._writeOffset, off + value.length);
        } else {
            this._writeOffset += value.length;
        }
        return this;
    }

    ensureReadable(len, offset) {
        const off = typeof offset === 'number' ? offset : this._readOffset;
        if (off < 0 || off + len > this.length) {
            throw new Error(ERRORS.INVALID_READ_BEYOND_BOUNDS);
        }
    }

    ensureInsertable(dataLength, offset) {
        checkOffsetValue(offset);
        this._ensureCapacity(this.length + dataLength);

        if (offset < this.length) {
            this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
        }
        
        if (offset + dataLength > this.length) {
            this.length = offset + dataLength;
        } else {
            this.length += dataLength;
        }
    }

    _ensureWriteable(dataLength, offset) {
        const off = typeof offset === 'number' ? offset : this._writeOffset;
        this._ensureCapacity(off + dataLength);
        if (off + dataLength > this.length) {
            this.length = off + dataLength;
        }
    }

    _ensureCapacity(minLength) {
        const oldLen = this._buff.length;
        if (minLength > oldLen) {
            let data = this._buff;
            let newLen = (oldLen * 3) / 2 + 1;
            if (newLen < minLength) {
                newLen = minLength;
            }
            this._buff = Buffer.allocUnsafe(newLen);
            data.copy(this._buff, 0, 0, oldLen);
        }
    }

    _readNumberValue(func, byteSize, offset) {
        this.ensureReadable(byteSize, offset);
        const value = func.call(this._buff, typeof offset === 'number' ? offset : this._readOffset);

        if (typeof offset === 'undefined') {
            this._readOffset += byteSize;
        }
        return value;
    }

    _insertNumberValue(func, byteSize, value, offset) {
        checkOffsetValue(offset);
        this.ensureInsertable(byteSize, offset);
        func.call(this._buff, value, offset);
        this._writeOffset += byteSize;
        return this;
    }

    _writeNumberValue(func, byteSize, value, offset) {
        const off = typeof offset === 'number' ? offset : this._writeOffset;
        this._ensureWriteable(byteSize, off);
        func.call(this._buff, value, off);

        if (typeof offset === 'number') {
            this._writeOffset = Math.max(this._writeOffset, off + byteSize);
        } else {
            this._writeOffset += byteSize;
        }
        return this;
    }
}

exports.SmartBuffer = SmartBuffer;
