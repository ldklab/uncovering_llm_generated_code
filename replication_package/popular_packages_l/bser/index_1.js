const EventEmitter = require('events');

class Bser {
  static loadFromBuffer(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Invalid input: expected Buffer');
    }
    try {
      const length = buffer.readUIntBE(0, 4);
      const content = buffer.slice(4, 4 + length).toString();
      return JSON.parse(content);
    } catch (e) {
      throw new Error('Failed to parse buffer');
    }
  }

  static dumpToBuffer(value) {
    const json = JSON.stringify(value);
    const buffer = Buffer.alloc(4 + Buffer.byteLength(json));
    buffer.writeUIntBE(Buffer.byteLength(json), 0, 4);
    buffer.write(json, 4);
    return buffer;
  }
}

class BunserBuf extends EventEmitter {
  constructor() {
    super();
    this.buffer = Buffer.alloc(0);
  }

  append(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this._process();
  }

  _process() {
    try {
      while (this.buffer.length > 4) {
        const length = this.buffer.readUIntBE(0, 4);
        if (this.buffer.length >= 4 + length) {
          const valueBuffer = this.buffer.slice(4, 4 + length);
          const value = Bser.loadFromBuffer(Buffer.concat([Buffer.alloc(4), valueBuffer]));
          this.emit('value', value);
          this.buffer = this.buffer.slice(4 + length);
        } else {
          break;
        }
      }
    } catch (e) {
      this.emit('error', e);
    }
  }
}

module.exports = {
  loadFromBuffer: Bser.loadFromBuffer,
  dumpToBuffer: Bser.dumpToBuffer,
  BunserBuf: BunserBuf,
};
