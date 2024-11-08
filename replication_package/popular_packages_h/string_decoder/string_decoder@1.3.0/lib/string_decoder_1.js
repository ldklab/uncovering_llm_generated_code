'use strict';

const { Buffer } = require('safe-buffer');

function isSupportedEncoding(encoding) {
  return !!Buffer.isEncoding ? Buffer.isEncoding(encoding) : ['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].includes(('' + encoding).toLowerCase());
}

function _getNormalizedEncoding(enc) {
  if (!enc) return 'utf8';
  while (true) {
    switch (enc) {
      case 'utf8': case 'utf-8': return 'utf8';
      case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': return 'utf16le';
      case 'latin1': case 'binary': return 'latin1';
      case 'base64': case 'ascii': case 'hex': return enc;
      default: enc = ('' + enc).toLowerCase();
    }
  }
}

function normalizeEncoding(enc) {
  const nenc = _getNormalizedEncoding(enc);
  if (typeof nenc !== 'string' && (!Buffer.isEncoding || !isSupportedEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  let byteLength;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      byteLength = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      byteLength = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      byteLength = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(byteLength);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  let result;
  let startIndex;
  if (this.lastNeed) {
    result = this.fillLast(buf);
    if (result === undefined) return '';
    startIndex = this.lastNeed;
    this.lastNeed = 0;
  } else {
    startIndex = 0;
  }
  if (startIndex < buf.length) return result ? result + this.text(buf, startIndex) : this.text(buf, startIndex);
  return result || '';
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
  return (byte >> 6 === 0x02) ? -1 : -2;
}

function utf8CheckIncomplete(self, buf, i) {
  const j = buf.length - 1;
  if (j < i) return 0;
  const nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  return utf8CheckByte(buf[j]) >= 0 ? (self.lastNeed = utf8CheckByte(buf[j]) > 0 ? utf8CheckByte(buf[j]) - 2 : 0) : utf8CheckByte(buf[--j]) >= 0 ? (self.lastNeed = utf8CheckByte(buf[j]) > 0 ? utf8CheckByte(buf[j]) - 3 : 0) : 0;
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
  const result = buf && buf.length ? this.write(buf) : '';
  return this.lastNeed ? result + '\ufffd' : result;
}

function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    const r = buf.toString('utf16le', i);
    if (r) {
      if (r.charCodeAt(r.length - 1) >= 0xD800 && r.charCodeAt(r.length - 1) <= 0xDBFF) {
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
  const result = buf && buf.length ? this.write(buf) : '';
  return this.lastNeed ? result + this.lastChar.toString('utf16le', 0, this.lastTotal - this.lastNeed) : result;
}

function base64Text(buf, i) {
  const n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  const result = buf && buf.length ? this.write(buf) : '';
  return this.lastNeed ? result + this.lastChar.toString('base64', 0, 3 - this.lastNeed) : result;
}

function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

exports.StringDecoder = StringDecoder;
