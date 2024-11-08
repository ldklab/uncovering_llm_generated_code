const { EventEmitter } = require('events');
const { inherits } = require('util');
const { endianness } = require('os');
const Int64 = require('node-int64');

// Determine system endian-ness
const isBigEndian = endianness() === 'BE';

// Helper function to calculate next power of two
const nextPow2 = size => Math.pow(2, Math.ceil(Math.log(size) / Math.LN2));

class Accumulator {
  constructor(initsize = 8192) {
    this.buf = Buffer.alloc(nextPow2(initsize));
    this.readOffset = 0;
    this.writeOffset = 0;
  }

  writeAvail() {
    return this.buf.length - this.writeOffset;
  }

  readAvail() {
    return this.writeOffset - this.readOffset;
  }

  reserve(size) {
    if (size < this.writeAvail()) return;

    if (this.readOffset > 0) {
      this.buf.copy(this.buf, 0, this.readOffset, this.writeOffset);
      this.writeOffset -= this.readOffset;
      this.readOffset = 0;
    }

    if (size < this.writeAvail()) return;

    const newSize = nextPow2(this.buf.length + size - this.writeAvail());
    const newBuf = Buffer.alloc(newSize);
    this.buf.copy(newBuf);
    this.buf = newBuf;
  }

  append(buf) {
    if (Buffer.isBuffer(buf)) {
      this.reserve(buf.length);
      buf.copy(this.buf, this.writeOffset);
      this.writeOffset += buf.length;
    } else {
      const size = Buffer.byteLength(buf);
      this.reserve(size);
      this.buf.write(buf, this.writeOffset);
      this.writeOffset += size;
    }
  }

  assertReadableSize(size) {
    if (this.readAvail() < size) {
      throw new Error(`Insufficient data: needed ${size}, have ${this.readAvail()}`);
    }
  }

  peekString(size) {
    this.assertReadableSize(size);
    return this.buf.toString('utf-8', this.readOffset, this.readOffset + size);
  }

  readString(size) {
    const str = this.peekString(size);
    this.readOffset += size;
    return str;
  }

  peekInt(size) {
    this.assertReadableSize(size);
    switch (size) {
      case 1: return this.buf.readInt8(this.readOffset);
      case 2: return isBigEndian ? this.buf.readInt16BE(this.readOffset) : this.buf.readInt16LE(this.readOffset);
      case 4: return isBigEndian ? this.buf.readInt32BE(this.readOffset) : this.buf.readInt32LE(this.readOffset);
      case 8: return new Int64(isBigEndian ? this.buf.slice(this.readOffset, this.readOffset + 8) : byteswap64(this.buf.slice(this.readOffset, this.readOffset + 8)));
      default: throw new Error(`Invalid integer size: ${size}`);
    }
  }

  readInt(bytes) {
    const intValue = this.peekInt(bytes);
    this.readOffset += bytes;
    return intValue instanceof Int64 && isFinite(intValue.valueOf()) ? intValue.valueOf() : intValue;
  }

  readAdvance(size) {
    if (size > 0) {
      this.assertReadableSize(size);
    } else if (size < 0 && this.readOffset + size < 0) {
      throw new Error(`Advance with negative offset would seek off the start of the buffer`);
    }
    this.readOffset += size;
  }

  writeByte(value) {
    this.reserve(1);
    this.buf.writeInt8(value, this.writeOffset);
    this.writeOffset++;
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
      throw new Error(`Unsupported integer size: ${size}`);
    }
    this.writeOffset += size;
  }

  writeDouble(value) {
    this.reserve(8);
    isBigEndian ? this.buf.writeDoubleBE(value, this.writeOffset) : this.buf.writeDoubleLE(value, this.writeOffset);
    this.writeOffset += 8;
  }
}

const BserConst = {
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
  NULL: 0x0A,
  TEMPLATE: 0x0B,
  SKIP: 0x0C
};

const State = {
  NEED_PDU: 0,
  FILL_PDU: 1
};

const MaxInts = {
  INT8: 127,
  INT16: 32767,
  INT32: 2147483647
};

class BunserBuf extends EventEmitter {
  constructor() {
    super();
    this.buf = new Accumulator();
    this.state = State.NEED_PDU;
  }

  append(buf, synchronous = false) {
    if (synchronous) {
      this.buf.append(buf);
      return this.process(true);
    }

    try {
      this.buf.append(buf);
    } catch (err) {
      this.emit('error', err);
      return;
    }
    this.processLater();
  }

  processLater() {
    process.nextTick(() => {
      try {
        this.process(false);
      } catch (err) {
        this.emit('error', err);
      }
    });
  }

  process(synchronous = false) {
    if (this.state === State.NEED_PDU) {
      if (this.buf.readAvail() < 2) {
        return;
      }
      this.expectCode(BserConst.ARRAY);
      this.expectCode(BserConst.OBJECT);
      const pduLen = this.decodeInt(true);
      if (pduLen === false) {
        this.buf.readAdvance(-2);
        return;
      }
      this.buf.reserve(pduLen);
      this.state = State.FILL_PDU;
    }

    if (this.state === State.FILL_PDU) {
      if (this.buf.readAvail() < this.pduLen) {
        return;
      }
      const val = this.decodeAny();
      if (synchronous) {
        return val;
      }
      this.emit('value', val);
      this.state = State.NEED_PDU;
    }

    if (!synchronous && this.buf.readAvail() > 0) {
      this.processLater();
    }
  }

  raise(reason) {
    throw new Error(`${reason}, in Buffer of length ${this.buf.buf.length} ` +
      `(${this.buf.readAvail()} readable) at offset ${this.buf.readOffset} buffer: ` +
      `${JSON.stringify(this.buf.buf.slice(this.buf.readOffset, this.buf.readOffset + 32).toJSON())}`);
  }

  expectCode(expected) {
    const code = this.buf.readInt(1);
    if (code !== expected) {
      this.raise(`Expected BSER opcode ${expected}, but got ${code}`);
    }
  }

  decodeAny() {
    const code = this.buf.peekInt(1);
    switch (code) {
      case BserConst.INT8:
      case BserConst.INT16:
      case BserConst.INT32:
      case BserConst.INT64:
        return this.decodeInt();
      case BserConst.REAL:
        this.buf.readAdvance(1);
        return this.buf.readDouble();
      case BserConst.TRUE:
        this.buf.readAdvance(1);
        return true;
      case BserConst.FALSE:
        this.buf.readAdvance(1);
        return false;
      case BserConst.NULL:
        this.buf.readAdvance(1);
        return null;
      case BserConst.STRING:
        return this.decodeString();
      case BserConst.ARRAY:
        return this.decodeArray();
      case BserConst.OBJECT:
        return this.decodeObject();
      case BserConst.TEMPLATE:
        return this.decodeTemplate();
      default:
        this.raise(`Unhandled BSER opcode ${code}`);
    }
  }

  decodeArray() {
    this.expectCode(BserConst.ARRAY);
    const nitems = this.decodeInt();
    const arr = [];
    for (let i = 0; i < nitems; i++) {
      arr.push(this.decodeAny());
    }
    return arr;
  }

  decodeObject() {
    this.expectCode(BserConst.OBJECT);
    const nitems = this.decodeInt();
    const res = {};
    for (let i = 0; i < nitems; i++) {
      const key = this.decodeString();
      const val = this.decodeAny();
      res[key] = val;
    }
    return res;
  }

  decodeTemplate() {
    this.expectCode(BserConst.TEMPLATE);
    const keys = this.decodeArray();
    const nitems = this.decodeInt();
    const arr = [];
    for (let i = 0; i < nitems; i++) {
      const obj = {};
      for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
        if (this.buf.peekInt(1) === BserConst.SKIP) {
          this.buf.readAdvance(1);
          continue;
        }
        obj[keys[keyIdx]] = this.decodeAny();
      }
      arr.push(obj);
    }
    return arr;
  }

  decodeString() {
    this.expectCode(BserConst.STRING);
    const len = this.decodeInt();
    return this.buf.readString(len);
  }

  decodeInt(relaxSizeAsserts = false) {
    if (relaxSizeAsserts && this.buf.readAvail() < 1) {
      return false;
    }
    this.buf.assertReadableSize(1);

    const code = this.buf.peekInt(1);
    let size = 0;
    switch (code) {
      case BserConst.INT8:
        size = 1;
        break;
      case BserConst.INT16:
        size = 2;
        break;
      case BserConst.INT32:
        size = 4;
        break;
      case BserConst.INT64:
        size = 8;
        break;
      default:
        this.raise(`Invalid BSER int encoding ${code}`);
    }

    if (relaxSizeAsserts && this.buf.readAvail() < 1 + size) {
      return false;
    }

    this.buf.readAdvance(1);
    return this.buf.readInt(size);
  }
}

function loadFromBuffer(input) {
  const buf = new BunserBuf();
  const result = buf.append(input, true);
  if (buf.buf.readAvail()) {
    throw new Error('Excess data found after input buffer, use BunserBuf instead');
  }
  if (typeof result === 'undefined') {
    throw new Error('No BSER found in string and no error raised!?');
  }
  return result;
}

function byteswap64(buf) {
  const swapped = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    swapped[i] = buf[buf.length - i - 1];
  }
  return swapped;
}

function dump_int64(buf, val) {
  const be = val.toBuffer();
  buf.writeByte(BserConst.INT64);
  buf.append(isBigEndian ? be : byteswap64(be));
}

function dump_int(buf, val) {
  const abs = Math.abs(val);
  if (abs <= MaxInts.INT8) {
    buf.writeByte(BserConst.INT8);
    buf.writeInt(val, 1);
  } else if (abs <= MaxInts.INT16) {
    buf.writeByte(BserConst.INT16);
    buf.writeInt(val, 2);
  } else if (abs <= MaxInts.INT32) {
    buf.writeByte(BserConst.INT32);
    buf.writeInt(val, 4);
  } else {
    dump_int64(buf, new Int64(val));
  }
}

function dump_any(buf, val) {
  switch (typeof val) {
    case 'number':
      isFinite(val) && Math.floor(val) === val ? dump_int(buf, val) : buf.writeDouble(val);
      buf.writeByte(BserConst.REAL);
      break;
    case 'string':
      buf.writeByte(BserConst.STRING);
      dump_int(buf, Buffer.byteLength(val));
      buf.append(val);
      break;
    case 'boolean':
      buf.writeByte(val ? BserConst.TRUE : BserConst.FALSE);
      break;
    case 'object':
      if (val === null) {
        buf.writeByte(BserConst.NULL);
      } else if (val instanceof Int64) {
        dump_int64(buf, val);
      } else if (Array.isArray(val)) {
        buf.writeByte(BserConst.ARRAY);
        dump_int(buf, val.length);
        val.forEach(item => dump_any(buf, item));
      } else {
        buf.writeByte(BserConst.OBJECT);
        const keys = Object.keys(val).filter(key => typeof val[key] !== 'undefined');
        dump_int(buf, keys.length);
        keys.forEach(key => {
          dump_any(buf, key);
          dump_any(buf, val[key]);
        });
      }
      break;
    default:
      throw new Error(`Cannot serialize type ${typeof val} to BSER`);
  }
}

function dumpToBuffer(val) {
  const buf = new Accumulator();
  buf.writeByte(0);
  buf.writeByte(1);
  buf.writeByte(BserConst.INT32);
  buf.writeInt(0, 4);

  dump_any(buf, val);

  const len = buf.writeOffset - 7;
  buf.writeOffset = 3;
  buf.writeInt(len, 4);
  buf.writeOffset = buf.writeOffset + len + 7;

  return buf.buf.slice(0, buf.writeOffset);
}

module.exports = { Accumulator, BunserBuf, loadFromBuffer, dumpToBuffer };
