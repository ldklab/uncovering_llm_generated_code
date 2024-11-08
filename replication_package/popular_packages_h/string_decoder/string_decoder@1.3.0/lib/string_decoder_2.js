'use strict';

const { Buffer } = require('safe-buffer');

function isEncoding(encoding) {
  encoding = '' + encoding;
  return ['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].includes(encoding.toLowerCase());
}

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  switch (enc.toLowerCase()) {
    case 'utf8': case 'utf-8':
      return 'utf8';
    case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le':
      return 'utf16le';
    case 'latin1': case 'binary':
      return 'latin1';
    case 'base64': case 'ascii': case 'hex':
      return enc;
    default:
      return undefined;
  }
}

function normalizeEncoding(enc) {
  const nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && !isEncoding(enc)) {
    throw new Error('Unknown encoding: ' + enc);
  }
  return nenc || enc;
}

exports.StringDecoder = StringDecoder;

function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  let nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  let r;
  let i = this.lastNeed ? (r = this.fillLast(buf), this.lastNeed ? 0 : this.lastNeed) : 0;
  return i < buf.length ? (r ? r + this.text(buf, i) : this.text(buf, i)) : r || '';
};

StringDecoder.prototype.end = utf8End;
StringDecoder.prototype.text = utf8Text;

StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;
  else if (byte >> 5 === 0x06) return 2;
  else if (byte >> 4 === 0x0E) return 3;
  else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

function utf8CheckIncomplete(self, buf, i) {
  const j = buf.length - 1;
  if (j < i) return 0;
  let nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb === 2 ? 0 : nb - 3;
    return nb;
  }
  return 0;
}

function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

function utf8FillLast(buf) {
  const p = this.lastTotal - this.lastNeed;
  const r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

function utf8Text(buf, i) {
  const total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  const end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

function utf8End(buf) {
  const r = buf && buf.length ? this.write(buf) : '';
  return this.lastNeed ? r + '\ufffd' : r;
}

function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    let r = buf.toString('utf16le', i);
    if (r) {
      const c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

function utf16End(buf) {
  const r = buf && buf.length ? this.write(buf) : '';
  return this.lastNeed ? r + this.lastChar.toString('utf16le', 0, this.lastTotal - this.lastNeed) : r;
}

function base64Text(buf, i) {
  const n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  this.lastChar[0] = n === 1 ? buf[buf.length - 1] : buf[buf.length - 2];
  if (n === 2) this.lastChar[1] = buf[buf.length - 1];
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  const r = buf && buf.length ? this.write(buf) : '';
  return this.lastNeed ? r + this.lastChar.toString('base64', 0, 3 - this.lastNeed) : r;
}

function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
