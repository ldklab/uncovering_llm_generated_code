// smart-buffer.js

class SmartBuffer {
    constructor(options = {}) {
        this._options = this._sanitizeOptions(options);
        this._buffer = this._options.buffer || Buffer.alloc(this._options.size || 4096);
        this._encoding = this._options.encoding || 'utf8';
        this.readOffset = 0;
        this.writeOffset = 0;
    }

    static fromBuffer(buffer, encoding = 'utf8') {
        return new SmartBuffer({ buffer, encoding });
    }

    static fromSize(size, encoding = 'utf8') {
        return new SmartBuffer({ size, encoding });
    }

    static fromOptions(options) {
        return new SmartBuffer(options);
    }

    _sanitizeOptions(options) {
        if (options.buffer && options.size) {
            throw new Error("Specify either a buffer or a size, not both.");
        }
        return options;
    }

    _ensureCapacity(minCapacity) {
        if (this._buffer.length < minCapacity) {
            const largerBuffer = Buffer.alloc(Math.max(this._buffer.length * 2, minCapacity));
            this._buffer.copy(largerBuffer);
            this._buffer = largerBuffer;
        }
    }

    _adjustWriteOffset(bytes) {
        this._ensureCapacity(this.writeOffset + bytes);
        this.writeOffset += bytes;
    }

    writeUInt16LE(value, offset) {
        if (offset === undefined) {
            this._adjustWriteOffset(2);
            this._buffer.writeUInt16LE(value, this.writeOffset - 2);
        } else {
            this._ensureCapacity(offset + 2);
            this._buffer.writeUInt16LE(value, offset);
        }
    }

    writeStringNT(value, offset) {
        const length = Buffer.byteLength(value, this._encoding) + 1;
        if (offset === undefined) {
            this._adjustWriteOffset(length);
            this._buffer.write(value, this.writeOffset - length, length - 1, this._encoding);
            this._buffer[this.writeOffset - 1] = 0;
        } else {
            this._ensureCapacity(offset + length);
            this._buffer.write(value, offset, length - 1, this._encoding);
            this._buffer[offset + length - 1] = 0;
        }
    }

    insertUInt16LE(value, offset) {
        if (offset > this.writeOffset) {
            throw new Error("Offset is beyond current buffer end.");
        }
        this._ensureCapacity(this.writeOffset + 2);
        this._buffer.copy(this._buffer, offset + 2, offset, this.writeOffset);
        this._buffer.writeUInt16LE(value, offset);
        this.writeOffset += 2;
    }

    readUInt16LE(offset) {
        if (offset !== undefined) {
            return this._buffer.readUInt16LE(offset);
        }
        const value = this._buffer.readUInt16LE(this.readOffset);
        this.readOffset += 2;
        return value;
    }

    readStringNT() {
        const end = this._buffer.indexOf(0, this.readOffset);
        if (end === -1) {
            throw new Error("Null terminator not found.");
        }
        const value = this._buffer.toString(this._encoding, this.readOffset, end);
        this.readOffset = end + 1;
        return value;
    }

    toBuffer() {
        return this._buffer.slice(0, this.writeOffset);
    }
}

// Example usage
function createLoginPacket(username, password, age, country) {
    const packet = new SmartBuffer();
    packet.writeUInt16LE(0x0060); // Some packet type
    packet.writeStringNT(username);
    packet.writeStringNT(password);
    packet.writeUInt8(age);
    packet.writeStringNT(country);
    packet.insertUInt16LE(packet.writeOffset - 2, 2);

    return packet.toBuffer();
}

const login = createLoginPacket("Josh", "secret123", 22, "United States");

const reader = SmartBuffer.fromBuffer(login);

const loginInfo = {
    packetType: reader.readUInt16LE(),
    packetLength: reader.readUInt16LE(),
    username: reader.readStringNT(),
    password: reader.readStringNT(),
    age: reader.readUInt8(),
    country: reader.readStringNT()
};

console.log(loginInfo);

module.exports = {
    SmartBuffer
};
