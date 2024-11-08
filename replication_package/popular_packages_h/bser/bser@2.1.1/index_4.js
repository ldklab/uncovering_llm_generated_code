const EE = require('events').EventEmitter;
const util = require('util');
const os = require('os');
const Int64 = require('node-int64');

const isBigEndian = os.endianness() === 'BE';

// Function to get the next power of 2
const nextPow2 = size => Math.pow(2, Math.ceil(Math.log(size) / Math.LN2));

function Accumulator(initsize = 8192) {
  this.buf = Buffer.alloc(nextPow2(initsize));
  this.readOffset = 0;
  this.writeOffset = 0;
}
exports.Accumulator = Accumulator;

Accumulator.prototype.writeAvail = function() {
  return this.buf.length - this.writeOffset;
}

Accumulator.prototype.readAvail = function() {
  return this.writeOffset - this.readOffset;
}

Accumulator.prototype.reserve = function(size) {
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

Accumulator.prototype.append = function(buf) {
  const isBuff = Buffer.isBuffer(buf);
  const size = isBuff ? buf.length : Buffer.byteLength(buf);
  
  this.reserve(size);
  if (isBuff) {
    buf.copy(this.buf, this.writeOffset, 0, size);
  } else {
    this.buf.write(buf, this.writeOffset);
  }
  this.writeOffset += size;
}

Accumulator.prototype.assertReadableSize = function(size) {
  if (this.readAvail() < size) {
    throw new Error(`wanted to read ${size} bytes but only have ${this.readAvail()}`);
  }
}

Accumulator.prototype.peekString = function(size) {
  this.assertReadableSize(size);
  return this.buf.toString('utf-8', this.readOffset, this.readOffset + size);
}

Accumulator.prototype.readString = function(size) {
  const str = this.peekString(size);
  this.readOffset += size;
  return str;
}

// Function to handle integer reading
Accumulator.prototype.peekInt = function(size) {
  this.assertReadableSize(size);
  if (size === 8) {
    const big = this.buf.slice(this.readOffset, this.readOffset + 8);
    return new Int64(isBigEndian ? big : byteswap64(big));
  }
  
  const offset = isBigEndian ? `BE` : `LE`;
  return this.buf[`readInt${size * 8}${offset}`](this.readOffset);
}

Accumulator.prototype.readInt = function(bytes) {
  const ival = this.peekInt(bytes);
  this.readOffset += bytes;
  return ival instanceof Int64 && isFinite(ival.valueOf()) ? ival.valueOf() : ival;
}

Accumulator.prototype.peekDouble = function() {
  this.assertReadableSize(8);
  const offset = isBigEndian ? 'BE' : 'LE';
  return this.buf[`readDouble${offset}`](this.readOffset);
}

Accumulator.prototype.readDouble = function() {
  const dval = this.peekDouble();
  this.readOffset += 8;
  return dval;
}

Accumulator.prototype.readAdvance = function(size) {
  if (size > 0 && size > this.readAvail()) {
    throw new Error(`advance with positive offset would go beyond available data`);
  }
  if (size < 0 && this.readOffset + size < 0) {
    throw new Error(`advance with negative offset ${size} would seek off the start of the buffer`);
  }
  this.readOffset += size;
}

Accumulator.prototype.writeByte = function(value) {
  this.reserve(1);
  this.buf.writeInt8(value, this.writeOffset++);
}

Accumulator.prototype.writeInt = function(value, size) {
  this.reserve(size);
  const offset = isBigEndian ? 'BE' : 'LE';
  this.buf[`writeInt${size * 8}${offset}`](value, this.writeOffset);
  this.writeOffset += size;
}

Accumulator.prototype.writeDouble = function(value) {
  this.reserve(8);
  const offset = isBigEndian ? 'BE' : 'LE';
  this.buf[`writeDouble${offset}`](value, this.writeOffset);
  this.writeOffset += 8;
}

// BSER Constants
const [
  BSER_ARRAY, BSER_OBJECT, BSER_STRING, BSER_INT8, BSER_INT16, BSER_INT32,
  BSER_INT64, BSER_REAL, BSER_TRUE, BSER_FALSE, BSER_NULL, BSER_TEMPLATE, BSER_SKIP
] = Array.from({length: 13}, (_, i) => i);

const MAX_INT8 = 127, MAX_INT16 = 32767, MAX_INT32 = 2147483647;

function BunserBuf() {
  EE.call(this);
  this.buf = new Accumulator();
  this.state = ST_NEED_PDU;
}
util.inherits(BunserBuf, EE);
exports.BunserBuf = BunserBuf;

BunserBuf.prototype.append = function(buf, synchronous) {
  if (synchronous) {
    this.buf.append(buf);
    return this.process(synchronous);
  }

  try {
    this.buf.append(buf);
    this.processLater();
  } catch (err) {
    this.emit('error', err);
  }
}

BunserBuf.prototype.processLater = function() {
  process.nextTick(() => {
    try {
      this.process(false);
    } catch (err) {
      this.emit('error', err);
    }
  });
}

BunserBuf.prototype.process = function(synchronous) {
  if (this.state === ST_NEED_PDU) {
    if (this.buf.readAvail() < 2) return;

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
    if (this.buf.readAvail() < this.pduLen) return;

    const val = this.decodeAny();
    if (synchronous) return val;

    this.emit('value', val);
    this.state = ST_NEED_PDU;
  }

  if (!synchronous && this.buf.readAvail() > 0) {
    this.processLater();
  }
}

BunserBuf.prototype.raise = function(reason) {
  throw new Error(`${reason}, in Buffer of length ${this.buf.buf.length} (${this.buf.readAvail()} readable) at offset ${this.buf.readOffset} buffer: ${JSON.stringify(this.buf.buf.slice(this.buf.readOffset, this.buf.readOffset + 32).toJSON())}`);
}

BunserBuf.prototype.expectCode = function(expected) {
  const code = this.buf.readInt(1);
  if (code !== expected) {
    this.raise(`expected bser opcode ${expected} but got ${code}`);
  }
}

BunserBuf.prototype.decodeAny = function() {
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

BunserBuf.prototype.decodeArray = function() {
  this.expectCode(BSER_ARRAY);
  const nitems = this.decodeInt();
  const arr = [];
  for (let i = 0; i < nitems; ++i) {
    arr.push(this.decodeAny());
  }
  return arr;
}

BunserBuf.prototype.decodeObject = function() {
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

BunserBuf.prototype.decodeTemplate = function() {
  this.expectCode(BSER_TEMPLATE);
  const keys = this.decodeArray();
  const nitems = this.decodeInt();
  const arr = [];
  for (let i = 0; i < nitems; ++i) {
    const obj = {};
    for (const key of keys) {
      if (this.buf.peekInt(1) === BSER_SKIP) {
        this.buf.readAdvance(1);
        continue;
      }
      const val = this.decodeAny();
      obj[key] = val;
    }
    arr.push(obj);
  }
  return arr;
}

BunserBuf.prototype.decodeString = function() {
  this.expectCode(BSER_STRING);
  const len = this.decodeInt();
  return this.buf.readString(len);
}

BunserBuf.prototype.decodeInt = function(relaxSizeAsserts) {
  if (relaxSizeAsserts && (this.buf.readAvail() < 1)) {
    return false;
  } else {
    this.buf.assertReadableSize(1);
  }
  const code = this.buf.peekInt(1);
  const sizeMap = { [BSER_INT8]: 1, [BSER_INT16]: 2, [BSER_INT32]: 4, [BSER_INT64]: 8 };
  const size = sizeMap[code];
  
  if (size === undefined || (relaxSizeAsserts && (this.buf.readAvail() < 1 + size))) {
    this.raise(`invalid bser int encoding ${code}`);
  }
  
  this.buf.readAdvance(1);
  return this.buf.readInt(size);
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
exports.loadFromBuffer = loadFromBuffer;

function byteswap64(buf) {
  return Buffer.from(buf.toJSON().data.reverse());
}

function dump_int64(buf, val) {
  const be = val.toBuffer();
  const targetBuf = isBigEndian ? be : byteswap64(be);
  buf.writeByte(BSER_INT64);
  buf.append(targetBuf);
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
  if (val === null) {
    buf.writeByte(BSER_NULL);
    return;
  }
  
  switch (typeof val) {
    case 'number':
      isFinite(val) && Math.floor(val) === val ? dump_int(buf, val) : buf.writeByte(BSER_REAL) && buf.writeDouble(val);
      return;
    case 'string':
      buf.writeByte(BSER_STRING);
      dump_int(buf, Buffer.byteLength(val));
      buf.append(val);
      return;
    case 'boolean':
      buf.writeByte(val ? BSER_TRUE : BSER_FALSE);
      return;
    case 'object':
      val instanceof Int64 ? dump_int64(buf, val) : Array.isArray(val) ? dump_array(buf, val) : dump_object(buf, val);
      return;
    default:
      throw new Error(`cannot serialize type ${typeof val} to BSER`);
  }
}

function dump_array(buf, arr) {
  buf.writeByte(BSER_ARRAY);
  dump_int(buf, arr.length);
  arr.forEach(item => dump_any(buf, item));
}

function dump_object(buf, obj) {
  buf.writeByte(BSER_OBJECT);
  const keys = Object.keys(obj).filter(key => typeof obj[key] !== 'undefined');
  dump_int(buf, keys.length);
  keys.forEach(key => {
    dump_any(buf, key);
    try {
      dump_any(buf, obj[key]);
    } catch (e) {
      throw new Error(`${e.message} (while serializing object property with name \`${key}\`)`);
    }
  });
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
exports.dumpToBuffer = dumpToBuffer;
