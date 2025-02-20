// smart-buffer.js

class SmartBuffer {
    constructor(options = {}) {
        const sanitizedOptions = this._sanitizeOptions(options);
        this._buffer = sanitizedOptions.buff || Buffer.alloc(sanitizedOptions.size || 4096);
        this._encoding = sanitizedOptions.encoding || 'utf8';
        this.readOffset = 0;
        this.writeOffset = 0;
    }

    static fromBuffer(buffer, encoding = 'utf8') {
        return new SmartBuffer({ buff: buffer, encoding });
    }

    static fromSize(size, encoding = 'utf8') {
        return new SmartBuffer({ size, encoding });
    }

    static fromOptions(options) {
        return new SmartBuffer(options);
    }

    _sanitizeOptions(options) {
        if (options.buff && options.size) {
            throw new Error("Cannot specify both buffer and size.");
        }
        return options;
    }

    _ensureCapacity(minCapacity) {
        if (this._buffer.length < minCapacity) {
            const newBuffer = Buffer.alloc(Math.max(this._buffer.length * 2, minCapacity));
            this._buffer.copy(newBuffer);
            this._buffer = newBuffer;
        }
    }

    _moveWriteOffset(offset) {
        this._ensureCapacity(this.writeOffset + offset);
        this.writeOffset += offset;
    }

    writeUInt16LE(value, offset) {
        if (typeof offset === 'undefined') {
            this._moveWriteOffset(2);
            this._buffer.writeUInt16LE(value, this.writeOffset - 2);
        } else {
            this._ensureCapacity(offset + 2);
            this._buffer.writeUInt16LE(value, offset);
        }
    }

    writeStringNT(value, offset) {
        const len = Buffer.byteLength(value, this._encoding) + 1;
        if (typeof offset === 'undefined') {
            this._moveWriteOffset(len);
            this._buffer.write(value, this.writeOffset - len, len - 1, this._encoding);
            this._buffer[this.writeOffset - 1] = 0;
        } else {
            this._ensureCapacity(offset + len);
            this._buffer.write(value, offset, len - 1, this._encoding);
            this._buffer[offset + len - 1] = 0;
        }
    }

    insertUInt16LE(value, offset) {
        if (offset > this.writeOffset) {
            throw new Error("Offset is beyond end of current buffer.");
        }
        this._ensureCapacity(this.writeOffset + 2);
        this._buffer.copy(this._buffer, offset + 2, offset, this.writeOffset);
        this._buffer.writeUInt16LE(value, offset);
        this.writeOffset += 2;
    }

    readUInt16LE(offset) {
        if (typeof offset !== 'undefined') {
            return this._buffer.readUInt16LE(offset);
        }
        const value = this._buffer.readUInt16LE(this.readOffset);
        this.readOffset += 2;
        return value;
    }

    readStringNT() {
        const endIndex = this._buffer.indexOf(0, this.readOffset);
        if (endIndex === -1) {
            throw new Error("Null terminator not found.");
        }
        const stringValue = this._buffer.toString(this._encoding, this.readOffset, endIndex);
        this.readOffset = endIndex + 1;
        return stringValue;
    }

    toBuffer() {
        return this._buffer.slice(0, this.writeOffset);
    }
}

// Example usage
function createLoginPacket(username, password, age, country) {
    const packet = new SmartBuffer();
    packet.writeUInt16LE(0x0060); // Packet type
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
