"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const child_process = require("child_process");
const crypto = require("crypto");
const tty = require("tty");
const { TextEncoder, TextDecoder, SharedArrayBuffer, Atomics } = global;

class ByteBuffer {
  constructor(buf = new Uint8Array(1024)) {
    this.buf = buf;
    this.len = 0;
    this.ptr = 0;
  }

  _write(delta) {
    if (this.len + delta > this.buf.length) {
      const clone = new Uint8Array((this.len + delta) * 2);
      clone.set(this.buf);
      this.buf = clone;
    }
    this.len += delta;
    return this.len - delta;
  }

  write8(value) {
    const offset = this._write(1);
    this.buf[offset] = value;
  }

  write32(value) {
    const offset = this._write(4);
    writeUInt32LE(this.buf, value, offset);
  }

  write(bytes) {
    const offset = this._write(4 + bytes.length);
    writeUInt32LE(this.buf, bytes.length, offset);
    this.buf.set(bytes, offset + 4);
  }

  _read(delta) {
    if (this.ptr + delta > this.buf.length) throw new Error("Invalid packet");
    this.ptr += delta;
    return this.ptr - delta;
  }

  read8() {
    return this.buf[this._read(1)];
  }

  read32() {
    return readUInt32LE(this.buf, this._read(4));
  }

  read() {
    const length = this.read32();
    const bytes = new Uint8Array(length);
    const ptr = this._read(bytes.length);
    bytes.set(this.buf.subarray(ptr, ptr + length));
    return bytes;
  }
}

const encodePacket = (packet) => {
  let bb = new ByteBuffer();
  bb.write32(0); // placeholder for length
  bb.write32(packet.id << 1 | +!packet.isRequest);
  (function visit(value) {
    if (value === null) {
      bb.write8(0);
    } else if (typeof value === "boolean") {
      bb.write8(1);
      bb.write8(+value);
    } else if (typeof value === "number") {
      bb.write8(2);
      bb.write32(value | 0);
    } else if (typeof value === "string") {
      bb.write8(3);
      bb.write(encodeUTF8(value));
    } else if (value instanceof Uint8Array) {
      bb.write8(4);
      bb.write(value);
    } else if (Array.isArray(value)) {
      bb.write8(5);
      bb.write32(value.length);
      for (const item of value) visit(item);
    } else {
      const keys = Object.keys(value);
      bb.write8(6);
      bb.write32(keys.length);
      for (const key of keys) {
        bb.write(encodeUTF8(key));
        visit(value[key]);
      }
    }
  })(packet.value);
  writeUInt32LE(bb.buf, bb.len - 4, 0);
  return bb.buf.subarray(0, bb.len);
};

const decodePacket = (bytes) => {
  const bb = new ByteBuffer(bytes);
  const id = bb.read32();
  const isRequest = (id & 1) === 0;
  const value = (function visit() {
    switch (bb.read8()) {
      case 0: return null;
      case 1: return !!bb.read8();
      case 2: return bb.read32();
      case 3: return decodeUTF8(bb.read());
      case 4: return bb.read();
      case 5: {
        const count = bb.read32();
        const array = [];
        for (let i = 0; i < count; i++) array.push(visit());
        return array;
      }
      case 6: {
        const count = bb.read32();
        const obj = {};
        for (let i = 0; i < count; i++) {
          obj[decodeUTF8(bb.read())] = visit();
        }
        return obj;
      }
      default:
        throw new Error("Invalid packet");
    }
  })();

  if (bb.ptr !== bytes.length) throw new Error("Invalid packet");
  return { id: id >>> 1, isRequest, value };
};

const encodeUTF8 = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode.bind(new TextEncoder()) : (text) => Buffer.from(text);

const decodeUTF8 = typeof TextDecoder !== 'undefined' ? new TextDecoder().decode.bind(new TextDecoder()) : (bytes) => Buffer.from(bytes).toString();

const writeUInt32LE = (buffer, value, offset) => {
  buffer[offset++] = value;
  buffer[offset++] = value >> 8;
  buffer[offset++] = value >> 16;
  buffer[offset++] = value >> 24;
};

const readUInt32LE = (buffer, offset) => {
  return buffer[offset] |
         buffer[offset + 1] << 8 |
         buffer[offset + 2] << 16 |
         buffer[offset + 3] << 24;
};

const createChannel = (streamIn) => {
  let closeData = { didClose: false, reason: "" };
  let responseCallbacks = {};
  let nextRequestID = 0;
  let stdout = new Uint8Array(16 * 1024);
  let stdoutUsed = 0;
  let readFromStdout = (chunk) => {
    const limit = stdoutUsed + chunk.length;
    if (limit > stdout.length) {
      const swap = new Uint8Array(limit * 2);
      swap.set(stdout);
      stdout = swap;
    }
    stdout.set(chunk, stdoutUsed);
    stdoutUsed += chunk.length;
    let offset = 0;
    while (offset + 4 <= stdoutUsed) {
      const length = readUInt32LE(stdout, offset);
      if (offset + 4 + length > stdoutUsed) break;
      offset += 4;
      handleIncomingPacket(stdout.subarray(offset, offset + length));
      offset += length;
    }
    if (offset > 0) {
      stdout.copyWithin(0, offset, stdoutUsed);
      stdoutUsed -= offset;
    }
  };

  const handleIncomingPacket = (bytes) => {
    const packet = decodePacket(bytes);
    if (packet.isRequest) {
      // Handle request logic
    } else {
      const callback = responseCallbacks[packet.id];
      delete responseCallbacks[packet.id];
      if (packet.value.error) callback(packet.value.error, {});
      else callback(null, packet.value);
    }
  };
  return { readFromStdout };
};

let serviceInstance;

const ensureServiceIsRunning = () => {
  if (serviceInstance) return serviceInstance;
  const [command, args] = generateBinPath();
  const child = child_process.spawn(command, args.concat("--service"), {
    stdio: ["pipe", "pipe", "pipe"],
    cwd: process.cwd(),
  });

  const { readFromStdout } = createChannel({
    writeToStdin(bytes) {
      child.stdin.write(bytes);
    },
    readFileSync: fs.readFileSync,
    isSync: false,
    hasFS: true
  });

  child.stdin.on("error", () => { /* Error handling */ });
  child.on("error", () => { /* Error handling */ });
  child.stdout.on("data", readFromStdout);

  return {
    build: (options) => {
      // Implement build processing
    },
    transform: (input, options) => {
      // Implement transform processing
    }
  };
};

const generateBinPath = () => {
  const pkg = "@esbuild/darwin-x64";
  const subpath = "bin/esbuild";
  const binPath = require.resolve(`${pkg}/${subpath}`);
  return [binPath];
};

// Exported API
const build = (options) => ensureServiceIsRunning().build(options);
const transform = (input, options) => ensureServiceIsRunning().transform(input, options);

module.exports = {
  build,
  transform
};
