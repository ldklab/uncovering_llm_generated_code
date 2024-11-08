/* Copyright 2015-present Facebook, Inc. Licensed under the Apache License, Version 2.0 */

const { EventEmitter } = require('events');
const os = require('os');
const Int64 = require('node-int64');

const isBigEndian = os.endianness() === 'BE';

const BSER = {
  ARRAY: 0x00,
  OBJECT: 0x01,
  STRING: 0x02,
  INT8: 0x03,
  INT16: 0x04,
  INT32: 0x05,
  INT64: 0x06,
  REAL: 0x07,
  TRUE: 0x08,
  FALSE: 0x09,
  NULL: 0x0a,
  TEMPLATE: 0x0b,
  SKIP: 0x0c,
};

const State = {
  NEED_PDU: 0,
  FILL_PDU: 1,
};

function nextPowerOfTwo(size) {
  return Math.pow(2, Math.ceil(Math.log(size) / Math.LN2));
}

class Accumulator {
  constructor(initialSize = 8192) {
    this.buf = Buffer.alloc(nextPowerOfTwo(initialSize));
    this.readOffset = 0;
    this.writeOffset = 0;
  }

  static get [Symbol.species]() {
    return this;
  }

  writeAvailable() {
    return this.buf.length - this.writeOffset;
  }

  readAvailable() {
    return this.writeOffset - this.readOffset;
  }

  reserve(size) {
    if (size < this.writeAvailable()) return;

    if (this.readOffset > 0) {
      this.buf.copy(this.buf, 0, this.readOffset, this.writeOffset);
      this.writeOffset -= this.readOffset;
      this.readOffset = 0;
    }

    if (size < this.writeAvailable()) return;

    const newBuf = Buffer.alloc(nextPowerOfTwo(this.buf.length + size - this.writeAvailable()));
    this.buf.copy(newBuf);
    this.buf = newBuf;
  }

  append(data) {
    if (Buffer.isBuffer(data)) {
      this.reserve(data.length);
      data.copy(this.buf, this.writeOffset);
      this.writeOffset += data.length;
    } else {
      const size = Buffer.byteLength(data);
      this.reserve(size);
      this.buf.write(data, this.writeOffset);
      this.writeOffset += size;
    }
  }

  assertReadableSize(size) {
    if (this.readAvailable() < size) {
      throw new Error(`wanted to read ${size} bytes but only have ${this.readAvailable()}`);
    }
  }

  peekString(size) {
    this.assertReadableSize(size);
    return this.buf.toString('utf-8', this.readOffset, this.readOffset + size);
  }

  readString(size) {
    return this.peekString(size) + this.advance(size);
  }

  peekInt(size) {
    this.assertReadableSize(size);
    switch (size) {
      case 1:
        return this.buf.readInt8(this.readOffset, size);
      case 2:
        return isBigEndian ? this.buf.readInt16BE(this.readOffset, size) : this.buf.readInt16LE(this.readOffset, size);
      case 4:
        return isBigEndian ? this.buf.readInt32BE(this.readOffset, size) : this.buf.readInt32LE(this.readOffset, size);
      case 8: {
        const big = this.buf.slice(this.readOffset, this.readOffset + 8);
        return isBigEndian ? new Int64(big) : new Int64(byteswap64(big));
      }
      default:
        throw new Error(`invalid integer size ${size}`);
    }
  }

  readInt(bytes) {
    const value = this.peekInt(bytes);
    if (value instanceof Int64 && Number.isFinite(value.valueOf())) {
      return this.advance(bytes).valueOf();
    }
    return value;
  }

  peekDouble() {
    this.assertReadableSize(8);
    return isBigEndian ? this.buf.readDoubleBE(this.readOffset) : this.buf.readDoubleLE(this.readOffset);
  }

  readDouble() {
    return this.peekDouble() + this.advance(8);
  }

  advance(size) {
    if (size > 0 && this.readAvailable() < size) {
      throw new Error(`advance beyond buffer size ${size}`);
    } 
    this.readOffset += size;
    return this;
  }

  writeByte(value) {
    this.reserve(1);
    this.buf.writeInt8(value, this.writeOffset++);
  }

  writeInt(value, size) {
    this.reserve(size);
    if (size === 1) {
      this.buf.writeInt8(value, this.writeOffset);
    } else if (size === 2) {
      isBigEndian ? this.buf.writeInt16BE(value, this.writeOffset) : this.buf.writeInt16LE(value, this.writeOffset);
    } else if (size === 4) {
      isBigEndian ? this.buf.writeInt32BE(value, this.writeOffset) : this.buf.writeInt32LE(value, this.writeOffset);
    } else {
      throw new Error(`unsupported integer size ${size}`);
    }
    this.writeOffset += size;
  }

  writeDouble(value) {
    this.reserve(8);
    isBigEndian ? this.buf.writeDoubleBE(value, this.writeOffset) : this.buf.writeDoubleLE(value, this.writeOffset);
    this.writeOffset += 8;
  }
}
exports.Accumulator = Accumulator;

class BunserBuf extends EventEmitter {
  constructor() {
    super();
    this.buf = new Accumulator();
    this.state = State.NEED_PDU;
  }

  append(data, synchronous = false) {
    if (synchronous) {
      this.buf.append(data);
      return this.process(synchronous);
    }

    try {
      this.buf.append(data);
    } catch (error) {
      this.emit('error', error);
      return;
    }
    this.processLater();
  }

  processLater() {
    process.nextTick(() => {
      try {
        this.process(false);
      } catch (error) {
        this.emit('error', error);
      }
    });
  }

  process(synchronous) {
    if (this.state === State.NEED_PDU) {
      if (this.buf.readAvailable() < 2) return;

      this.expectCode(0);
      this.expectCode(1);
      this.pduLen = this.decodeInt(true);
      if (this.pduLen === false) {
        this.buf.advance(-2);
        return;
      }
      this.buf.reserve(this.pduLen);
      this.state = State.FILL_PDU;
    }

    if (this.state === State.FILL_PDU) {
      if (this.buf.readAvailable() < this.pduLen) return;

      const value = this.decodeAny();
      if (synchronous) return value;

      this.emit('value', value);
      this.state = State.NEED_PDU;
    }

    if (!synchronous && this.buf.readAvailable() > 0) {
      this.processLater();
    }
  }

  raise(reason) {
    throw new Error(`${reason}, in Buffer of length ${this.buf.buf.length} (${this.buf.readAvailable()} readable) at offset ${this.buf.readOffset} buffer: ${JSON.stringify(this.buf.buf.slice(this.buf.readOffset, this.buf.readOffset + 32).toJSON())}`);
  }

  expectCode(expected) {
    const code = this.buf.readInt(1);
    if (code !== expected) {
      this.raise(`expected bser opcode ${expected} but got ${code}`);
    }
  }

  decodeAny() {
    const code = this.buf.peekInt(1);
    switch (code) {
      case BSER.INT8:
      case BSER.INT16:
      case BSER.INT32:
      case BSER.INT64:
        return this.decodeInt();
      case BSER.REAL:
        this.buf.advance(1);
        return this.buf.readDouble();
      case BSER.TRUE:
        this.buf.advance(1);
        return true;
      case BSER.FALSE:
        this.buf.advance(1);
        return false;
      case BSER.NULL:
        this.buf.advance(1);
        return null;
      case BSER.STRING:
        return this.decodeString();
      case BSER.ARRAY:
        return this.decodeArray();
      case BSER.OBJECT:
        return this.decodeObject();
      case BSER.TEMPLATE:
        return this.decodeTemplate();
      default:
        this.raise(`unhandled bser opcode ${code}`);
    }
  }

  decodeArray() {
    this.expectCode(BSER.ARRAY);
    const nitems = this.decodeInt();
    const array = [];
    for (let i = 0; i < nitems; ++i) {
      array.push(this.decodeAny());
    }
    return array;
  }

  decodeObject() {
    this.expectCode(BSER.OBJECT);
    const nitems = this.decodeInt();
    const result = {};
    for (let i = 0; i < nitems; ++i) {
      const key = this.decodeString();
      const value = this.decodeAny();
      result[key] = value;
    }
    return result;
  }

  decodeTemplate() {
    this.expectCode(BSER.TEMPLATE);
    const keys = this.decodeArray();
    const nitems = this.decodeInt();
    const array = [];
    
    for (let i = 0; i < nitems; ++i) {
      const object = {};
      keys.forEach((key) => {
        if (this.buf.peekInt(1) === BSER.SKIP) {
          this.buf.advance(1);
          return;
        }
        const value = this.decodeAny();
        object[key] = value;
      });
      array.push(object);
    }
    
    return array;
  }

  decodeString() {
    this.expectCode(BSER.STRING);
    const length = this.decodeInt();
    return this.buf.readString(length);
  }

  decodeInt(relaxSizeAsserts = false) {
    const readAvailable = this.buf.readAvailable();
    if (relaxSizeAsserts && readAvailable < 1) return false;

    this.buf.assertReadableSize(1);
    const code = this.buf.peekInt(1);
    let size = 0;

    switch (code) {
      case BSER.INT8:
        size = 1;
        break;
      case BSER.INT16:
        size = 2;
        break;
      case BSER.INT32:
        size = 4;
        break;
      case BSER.INT64:
        size = 8;
        break;
      default:
        this.raise(`invalid bser int encoding ${code}`);
    }

    if (relaxSizeAsserts && readAvailable < 1 + size) return false;
    
    this.buf.advance(1);
    return this.buf.readInt(size);
  }
}
exports.BunserBuf = BunserBuf;

function loadFromBuffer(input) {
  const buf = new BunserBuf();
  const result = buf.append(input, true);
  
  if (buf.buf.readAvailable()) {
    throw new Error('excess data found after input buffer, use BunserBuf instead');
  }
  
  if (result === undefined) {
    throw new Error('no bser found in string and no error raised!?');
  }
  
  return result;
}
exports.loadFromBuffer = loadFromBuffer;

function byteswap64(buffer) {
  const swapBuffer = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    swapBuffer[i] = buffer[buffer.length - 1 - i];
  }
  return swapBuffer;
}

function dumpInt64(buffer, value) {
  const be = value.toBuffer();

  if (isBigEndian) {
    buffer.writeByte(BSER.INT64);
    buffer.append(be);
  } else {
    const le = byteswap64(be);
    buffer.writeByte(BSER.INT64);
    buffer.append(le);
  }
}

function dumpInt(buffer, value) {
  const absVal = Math.abs(value);
  if (absVal <= 127) {
    buffer.writeByte(BSER.INT8);
    buffer.writeInt(value, 1);
  } else if (absVal <= 32767) {
    buffer.writeByte(BSER.INT16);
    buffer.writeInt(value, 2);
  } else if (absVal <= 2147483647) {
    buffer.writeByte(BSER.INT32);
    buffer.writeInt(value, 4);
  } else {
    dumpInt64(buffer, new Int64(value));
  }
}

function dumpAny(buffer, value) {
  switch (typeof value) {
    case 'number':
      if (Number.isFinite(value) && Math.floor(value) === value) {
        dumpInt(buffer, value);
      } else {
        buffer.writeByte(BSER.REAL);
        buffer.writeDouble(value);
      }
      return;
    case 'string':
      buffer.writeByte(BSER.STRING);
      dumpInt(buffer, Buffer.byteLength(value));
      buffer.append(value);
      return;
    case 'boolean':
      buffer.writeByte(value ? BSER.TRUE : BSER.FALSE);
      return;
    case 'object':
      if (value === null) {
        buffer.writeByte(BSER.NULL);
        return;
      }
      if (value instanceof Int64) {
        dumpInt64(buffer, value);
        return;
      }
      if (Array.isArray(value)) {
        buffer.writeByte(BSER.ARRAY);
        dumpInt(buffer, value.length);
        value.forEach((item) => dumpAny(buffer, item));
        return;
      }

      buffer.writeByte(BSER.OBJECT);
      const keys = Object.keys(value).filter((key) => typeof value[key] !== 'undefined');
      dumpInt(buffer, keys.length);

      keys.forEach((key) => {
        dumpAny(buffer, key);
        dumpAny(buffer, value[key]);
      });
      return;
    default:
      throw new Error(`cannot serialize type ${typeof value} to BSER`);
  }
}

function dumpToBuffer(value) {
  const buffer = new Accumulator();
  
  buffer.writeByte(0);
  buffer.writeByte(1);
  buffer.writeByte(BSER.INT32);
  buffer.writeInt(0, 4);

  dumpAny(buffer, value);

  const len = buffer.writeOffset - 7;
  buffer.writeOffset = 3;
  buffer.writeInt(len, 4);
  buffer.writeOffset += 7;

  return buffer.buf.slice(0, buffer.writeOffset);
}
exports.dumpToBuffer = dumpToBuffer;
