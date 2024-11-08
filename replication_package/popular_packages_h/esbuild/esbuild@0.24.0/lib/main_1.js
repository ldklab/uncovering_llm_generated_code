"use strict";

const fs = require('fs');
const path = require('path');
const os = require('os');
const child_process = require('child_process');
const tty = require('tty');
let worker_threads;

try {
  worker_threads = require('worker_threads');
} catch {
  // Worker threads not available
}

const ESBUILD_VERSION = '0.24.0';
const ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || '';
let stopService, longLivedService;

class ByteBuffer {
  constructor(buf = new Uint8Array(1024)) {
    this.buf = buf;
    this.len = 0;
    this.ptr = 0;
  }

  _write(delta) {
    if (this.len + delta > this.buf.length) {
      const newArr = new Uint8Array((this.len + delta) * 2);
      newArr.set(this.buf);
      this.buf = newArr;
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
    if (this.ptr + delta > this.len) {
      throw new Error('Cannot read beyond buffer length');
    }
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
    const len = this.read32();
    const start = this._read(len);
    return this.buf.slice(start, start + len);
  }
}

function esbuildCommandAndArgs() {
  if (esbuildPathOverride()) return [ESBUILD_BINARY_PATH, []];

  const { binPath, isWASM } = generateBinPath();
  return isWASM ? ['node', [binPath]] : [binPath, []];
}

function generateBinPath() {
  if (ESBUILD_BINARY_PATH) {
    if (!fs.existsSync(ESBUILD_BINARY_PATH)) {
      console.warn(`Invalid ESBUILD_BINARY_PATH: ${ESBUILD_BINARY_PATH}`);
    } else {
      return { binPath: ESBUILD_BINARY_PATH, isWASM: false };
    }
  }

  const { pkg, subpath, isWASM } = pkgAndSubpathForCurrentPlatform();

  try {
    const resolvedPath = require.resolve(`${pkg}/${subpath}`);
    return { binPath: resolvedPath, isWASM };
  } catch {
    const binPath = downloadedBinPath(pkg, subpath);
    if (!fs.existsSync(binPath)) {
      throw new Error(`Cannot find binary for package "${pkg}".`);
    }
    return { binPath, isWASM };
  }
}

function pkgAndSubpathForCurrentPlatform() {
  const platform = `${process.platform} ${os.arch()} ${os.endianness()}`;

  const windowsPackages = {
    'win32 x64 LE': '@esbuild/win32-x64'
    // More mappings...
  };

  const unixPackages = {
    'linux x64 LE': '@esbuild/linux-x64',
    'darwin x64 LE': '@esbuild/darwin-x64'
    // More mappings...
  };

  const packageAndSubpath = windowsPackages[platform] || unixPackages[platform];

  if (!packageAndSubpath) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  return packageAndSubpath;
}

function isTTY() {
  return tty.isatty(2);
}

function ensureServiceIsRunning() {
  if (longLivedService) return longLivedService;

  const [command, args] = esbuildCommandAndArgs();
  const child = child_process.spawn(command, args.concat(`--service=${ESBUILD_VERSION}`, "--ping"), {
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'ignore'],
    cwd: process.cwd()
  });

  const { readFromStdout, afterClose, service } = createChannel({
    writeToStdin(bytes) {
      child.stdin.write(bytes, (err) => {
        if (err) afterClose(err);
      });
    },
    isSync: false
  });

  child.stdin.on('error', afterClose);
  child.on('error', afterClose);
  child.stdout.on('data', readFromStdout);
  child.stdout.on('end', afterClose);

  stopService = () => {
    child.stdin.destroy();
    child.stdout.destroy();
    child.kill();
    initializeWasCalled = false;
    longLivedService = undefined;
    stopService = undefined;
  };

  let refCount = 0;
  child.unref();
  const refs = {
    ref() {
      if (++refCount === 1) child.ref();
    },
    unref() {
      if (--refCount === 0) child.unref();
    }
  };

  longLivedService = {
    build(options) {
      return new Promise((resolve, reject) => {
        service.buildOrContext({
          callName: 'build',
          refs,
          options,
          isTTY: isTTY(),
          callback: (err, res) => {
            if (err) reject(err);
            else resolve(res);
          }
        });
      });
    },
    // ... Other APIs like transform, analyzeMetafile, etc.
  };

  return longLivedService;
}

function randomFileName() {
  return path.join(os.tmpdir(), `esbuild-${crypto.randomBytes(32).toString('hex')}`);
}

module.exports = {
  build: (options) => ensureServiceIsRunning().build(options),
  // ... Other exports like transform, formatMessages, etc.
};
