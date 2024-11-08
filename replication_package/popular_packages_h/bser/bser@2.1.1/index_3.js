const { EventEmitter } = require('events');
const util = require('util');
const os = require('os');
const Int64 = require('node-int64');

const isBigEndian = os.endianness() == 'BE';

function nextPow2(size) {
  return Math.pow(2, Math.ceil(Math.log(size) / Math.LN2));
}

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

    const buf = Buffer.alloc(nextPow2(this.buf.length + size - this.writeAvail()));
    this.buf.copy(buf);
    this.buf = buf;
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
      throw new Error(`wanted to read ${size} bytes but only have ${this.readAvail()}`);
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
      case 1:
        return this.buf.readInt8(this.readOffset);
      case 2:
        return isBigEndian ? this.buf.readInt16BE(this.readOffset) : this.buf.readInt16LE(this.readOffset);
      case 4:
        return isBigEndian ? this.buf.readInt32BE(this.readOffset) : this.buf.readInt32LE(this.readOffset);
      case 8: {
        let big = this.buf.slice(this.readOffset, this.readOffset + 8);
        return isBigEndian ? new Int64(big) : new Int64(byteswap64(big));
      }
      default:
        throw new Error(`invalid integer size ${size}`);
    }
  }

  readInt(bytes) {
    let ival = this.peekInt(bytes);
    if (ival instanceof Int64 && isFinite(ival.valueOf())) {
      ival = ival.valueOf();
    }
    this.readOffset += bytes;
    return ival;
  }

  peekDouble() {
    this.assertReadableSize(8);
    return isBigEndian ? this.buf.readDoubleBE(this.readOffset) : this.buf.readDoubleLE(this.readOffset);
  }

  readDouble() {
    const dval = this.peekDouble();
    this.readOffset += 8;
    return dval;
  }

  readAdvance(size) {
    if (size > 0) {
      this.assertReadableSize(size);
    } else if (size < 0 && this.readOffset + size < 0) {
      throw new Error(`advance with negative offset ${size} would seek off the start of the buffer`);
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
    switch (size) {
      case 1:
        this.buf.writeInt8(value, this.writeOffset);
        break;
      case 2:
        if (isBigEndian) {
          this.buf.writeInt16BE(value, this.writeOffset);
        } else {
          this.buf.writeInt16LE(value, this.writeOffset);
        }
        break;
      case 4:
        if (isBigEndian) {
          this.buf.writeInt32BE(value, this.writeOffset);
        } else {
          this.buf.writeInt32LE(value, this.writeOffset);
        }
        break;
      default:
        throw new Error(`unsupported integer size ${size}`);
    }
    this.writeOffset += size;
  }

  writeDouble(value) {
    this.reserve(8);
    if (isBigEndian) {
      this.buf.writeDoubleBE(value, this.writeOffset);
    } else {
      this.buf.writeDoubleLE(value, this.writeOffset);
    }
    this.writeOffset += 8;
  }
}

const BSER_ARRAY = 0x00;
const BSER_OBJECT = 0x01;
const BSER_STRING = 0x02;
const BSER_INT8 = 0x03;
const BSER_INT16 = 0x04;
const BSER_INT32 = 0x05;
const BSER_INT64 = 0x06;
const BSER_REAL = 0x07;
const BSER_TRUE = 0x08;
const BSER_FALSE = 0x09;
const BSER_NULL = 0x0a;
const BSER_TEMPLATE = 0x0b;
const BSER_SKIP = 0x0c;

const ST_NEED_PDU = 0;
const ST_FILL_PDU = 1;

const MAX_INT8 = 127;
const MAX_INT16 = 32767;
const MAX_INT32 = 2147483647;

class BunserBuf extends EventEmitter {
  constructor() {
    super();
    this.buf = new Accumulator();
    this.state = ST_NEED_PDU;
  }

  append(buf, synchronous) {
    if (synchronous) {
      this.buf.append(buf);
      return this.process(synchronous);
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

  process(synchronous) {
    if (this.state === ST_NEED_PDU) {
      if (this.buf.readAvail() < 2) {
        return;
      }
      this.expectCode(0);
      this.expectCode(1);
      this.pduLen = this.decodeInt(true);
      if (this.pduLen === false) {
        this.buf.readAdvance(-2);
        return;
      }
      this.buf.reserve(this.pduLen);
      this.state = ST_FILL_PDU;
    }

    if (this.state === ST_FILL_PDU) {
      if (this.buf.readAvail() < this.pduLen) {
        return;
      }
      const val = this.decodeAny();
      if (synchronous) {
        return val;
      }
      this.emit('value', val);
      this.state = ST_NEED_PDU;
    }

    if (!synchronous && this.buf.readAvail() > 0) {
      this.processLater();
    }
  }

  raise(reason) {
    throw new Error(`${reason}, in Buffer of length ${this.buf.buf.length} (${this.buf.readAvail()} readable) at offset ${this.buf.readOffset} buffer: ${JSON.stringify(this.buf.buf.slice(this.buf.readOffset, this.buf.readOffset + 32).toJSON())}`);
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
      case BSER_INT8:
      case BSER_INT16:
      case BSER_INT32:
      case BSER_INT64:
        return this.decodeInt();
      case BSER_REAL:
        this.buf.readAdvance(1);
        return this.buf.readDouble();
      case BSER_TRUE:
        this.buf.readAdvance(1);
        return true;
      case BSER_FALSE:
        this.buf.readAdvance(1);
        return false;
      case BSER_NULL:
        this.buf.readAdvance(1);
        return null;
      case BSER_STRING:
        return this.decodeString();
      case BSER_ARRAY:
        return this.decodeArray();
      case BSER_OBJECT:
        return this.decodeObject();
      case BSER_TEMPLATE:
        return this.decodeTemplate();
      default:
        this.raise(`unhandled bser opcode ${code}`);
    }
  }

  decodeArray() {
    this.expectCode(BSER_ARRAY);
    const nitems = this.decodeInt();
    const arr = [];
    for (let i = 0; i < nitems; ++i) {
      arr.push(this.decodeAny());
    }
    return arr;
  }

  decodeObject() {
    this.expectCode(BSER_OBJECT);
    const nitems = this.decodeInt();
    const res = {};
    for (let i = 0; i < nitems; ++i) {
      const key = this.decodeString();
      const val = this.decodeAny();
      res[key] = val;
    }
    return res;
  }

  decodeTemplate() {
    this.expectCode(BSER_TEMPLATE);
    const keys = this.decodeArray();
    const nitems = this.decodeInt();
    const arr = [];
    for (let i = 0; i < nitems; ++i) {
      const obj = {};
      for (let keyidx = 0; keyidx < keys.length; ++keyidx) {
        if (this.buf.peekInt(1) === BSER_SKIP) {
          this.buf.readAdvance(1);
          continue;
        }
        const val = this.decodeAny();
        obj[keys[keyidx]] = val;
      }
      arr.push(obj);
    }
    return arr;
  }

  decodeString() {
    this.expectCode(BSER_STRING);
    const len = this.decodeInt();
    return this.buf.readString(len);
  }

  decodeInt(relaxSizeAsserts) {
    if (relaxSizeAsserts && this.buf.readAvail() < 1) {
      return false;
    } else {
      this.buf.assertReadableSize(1);
    }
    const code = this.buf.peekInt(1);
    let size = 0;
    switch (code) {
      case BSER_INT8:
        size = 1;
        break;
      case BSER_INT16:
        size = 2;
        break;
      case BSER_INT32:
        size = 4;
        break;
      case BSER_INT64:
        size = 8;
        break;
      default:
        this.raise(`invalid bser int encoding ${code}`);
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
    throw Error('excess data found after input buffer, use BunserBuf instead');
  }
  if (typeof result === 'undefined') {
    throw Error('no bser found in string and no error raised!?');
  }
  return result;
}

function byteswap64(buf) {
  const swap = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    swap[i] = buf[buf.length - 1 - i];
  }
  return swap;
}

function dump_int64(buf, val) {
  const be = val.toBuffer();

  if (isBigEndian) {
    buf.writeByte(BSER_INT64);
    buf.append(be);
    return;
  }
  const le = byteswap64(be);
  buf.writeByte(BSER_INT64);
  buf.append(le);
}

function dump_int(buf, val) {
  const abs = Math.abs(val);
  if (abs <= MAX_INT8) {
    buf.writeByte(BSER_INT8);
    buf.writeInt(val, 1);
  } else if (abs <= MAX_INT16) {
    buf.writeByte(BSER_INT16);
    buf.writeInt(val, 2);
  } else if (abs <= MAX_INT32) {
    buf.writeByte(BSER_INT32);
    buf.writeInt(val, 4);
  } else {
    dump_int64(buf, new Int64(val));
  }
}

function dump_any(buf, val) {
  switch (typeof val) {
    case 'number':
      if (isFinite(val) && Math.floor(val) === val) {
        dump_int(buf, val);
      } else {
        buf.writeByte(BSER_REAL);
        buf.writeDouble(val);
      }
      break;
    case 'string':
      buf.writeByte(BSER_STRING);
      dump_int(buf, Buffer.byteLength(val));
      buf.append(val);
      break;
    case 'boolean':
      buf.writeByte(val ? BSER_TRUE : BSER_FALSE);
      break;
    case 'object':
      if (val === null) {
        buf.writeByte(BSER_NULL);
      } else if (val instanceof Int64) {
        dump_int64(buf, val);
      } else if (Array.isArray(val)) {
        buf.writeByte(BSER_ARRAY);
        dump_int(buf, val.length);
        for (const item of val) {
          dump_any(buf, item);
        }
      } else {
        buf.writeByte(BSER_OBJECT);
        const keys = Object.keys(val).filter(key => val[key] !== undefined);
        dump_int(buf, keys.length);
        for (const key of keys) {
          dump_any(buf, key);
          dump_any(buf, val[key]);
        }
      }
      break;
    default:
      throw new Error(`cannot serialize type ${typeof val} to BSER`);
  }
}

function dumpToBuffer(val) {
  const buf = new Accumulator();
  buf.writeByte(0);
  buf.writeByte(1);
  buf.writeByte(BSER_INT32);
  buf.writeInt(0, 4);

  dump_any(buf, val);

  const off = buf.writeOffset;
  const len = off - 7;
  buf.writeOffset = 3;
  buf.writeInt(len, 4);
  buf.writeOffset = off;

  return buf.buf.slice(0, off);
}

module.exports = {
  Accumulator,
  BunserBuf,
  loadFromBuffer,
  dumpToBuffer,
};
