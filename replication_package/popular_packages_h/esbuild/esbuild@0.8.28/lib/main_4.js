const { spawn, execFileSync } = require('child_process');
const { readFileSync, writeFile, unlink, mkdirSync } = require('fs');
const { randomBytes } = require('crypto');
const { join } = require('path');
const { tmpdir } = require('os');
const { isatty } = require('tty');

const defineModuleAndExport = (target, all) => {
  Object.defineProperty(target, "__esModule", { value: true });
  for (const name in all) {
    Object.defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const promiseBasedAsync = (self, args, generator) => {
  return new Promise((resolve, reject) => {
    const step = result => {
      result.done ? resolve(result.value) : Promise.resolve(result.value).then(fulfilled, rejected);
    };
    const fulfilled = value => {
      try { step(generator.next(value)); }
      catch (error) { reject(error); }
    };
    const rejected = value => {
      try { step(generator.throw(value)); }
      catch (error) { reject(error); }
    };
    step((generator = generator.apply(self, args)).next());
  });
};

defineModuleAndExport(exports, {
  build: () => build,
  buildSync: () => buildSync,
  serve: () => serve,
  startService: () => startService,
  transform: () => transform,
  transformSync: () => transformSync,
  version: () => version
});

class ByteBuffer {
  constructor(buffer = new Uint8Array(1024)) {
    this.buffer = buffer;
    this.length = 0;
    this.pointer = 0;
  }

  write8(value) { this.buffer[this._write(1)] = value; }

  write32(value) {
    const offset = this._write(4);
    this.buffer[offset] = value & 0xFF;
    this.buffer[offset + 1] = (value >> 8) & 0xFF;
    this.buffer[offset + 2] = (value >> 16) & 0xFF;
    this.buffer[offset + 3] = (value >> 24) & 0xFF;
  }

  _write(delta) {
    if (this.length + delta > this.buffer.length) {
      let newBuffer = new Uint8Array((this.length + delta) * 2);
      newBuffer.set(this.buffer, 0);
      this.buffer = newBuffer;
    }
    this.length += delta;
    return this.length - delta;
  }

  read8() { return this.buffer[this._read(1)]; }

  read32() {
    const offset = this._read(4);
    return this.buffer[offset] | this.buffer[offset + 1] << 8 | this.buffer[offset + 2] << 16 | this.buffer[offset + 3] << 24;
  }

  _read(delta) {
    if (this.pointer + delta > this.length) throw new Error("Invalid packet");
    this.pointer += delta;
    return this.pointer - delta;
  }
}

let encodeUTF8, decodeUTF8;
if (typeof TextEncoder !== 'undefined' && typeof TextDecoder !== 'undefined') {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  encodeUTF8 = text => encoder.encode(text);
  decodeUTF8 = bytes => decoder.decode(bytes);
} else if (typeof Buffer !== 'undefined') {
  encodeUTF8 = text => Buffer.from(text);
  decodeUTF8 = bytes => Buffer.from(bytes).toString();
} else {
  throw new Error("No UTF-8 codec found");
}

const handleResponse = (callbacks, serviceStoppedMsg) => response => {
  response.isRequest
    ? handleRequest(response.id, response.value)
    : callbacks.get(response.id)?.(response.value.error, response.value);
};

function createChannel(streamIn) {
  const responseCallbacks = new Map();
  const serviceStoppedError = "The service was stopped";

  return {
    readFromStdout(buffer) {
      try {
        decodePacket(buffer).forEach(handleResponse(responseCallbacks, serviceStoppedError));
      } catch (error) {
        afterClose();
      }
    },
    afterClose() {
      responseCallbacks.forEach(callback => callback(serviceStoppedError, null));
      responseCallbacks.clear();
    },
    service: {
      buildOrServe(name, serveConfig, buildOptions, isTTY, completionCallback) {
        if (!buildOptions) {
          throw new Error(`Invalid build options for ${name}`);
        }

        const flags = extractFlagsForBuildOptions(name, buildOptions, isTTY);
        const request = { command: 'build', flags };
        const callbacks = { response: completionCallback };

        responseCallbacks.set(request.id, callbacks.response);

        streamIn.writeToStdin(encodePacket(request));
      }
    }
  };
}

// Actual implementations and service operations...
const startService = (options = {}) => {
  const { isWorker, wasmURL } = validateOptions(options);

  if (isWorker || wasmURL) {
    throw new Error("Options 'worker' and 'wasmURL' are restricted to browsers");
  }

  const [execPath, execArgs] = resolveEsbuildCommand();
  
  const childProcess = spawn(execPath, execArgs, {
    stdio: ['pipe', 'pipe', 'inherit'],
    cwd: process.cwd(),
    windowsHide: true
  });

  const stdioChannel = createChannel({
    writeToStdin(buffer) {
      childProcess.stdin.write(buffer);
    }
  });

  childProcess.stdout.on('data', stdioChannel.readFromStdout);
  childProcess.on('close', stdioChannel.afterClose);

  return stdioChannel.service;
};

const resolveEsbuildCommand = () => {
  if (process.env.ESBUILD_BINARY_PATH) {
    return [require('path').resolve(process.env.ESBUILD_BINARY_PATH), []];
  }

  const isWin = process.platform === 'win32';
  const baseDir = join(__dirname, '..');

  return isWin 
    ? [join(baseDir, 'esbuild.exe'), []]
    : [join(baseDir, 'bin', 'esbuild'), []];
};

const validateOptions = ({ wasmURL, worker }) => ({
  isWorker: typeof worker === 'boolean' ? worker : false,
  wasmURL: typeof wasmURL === 'string' ? wasmURL : null
});

class ServiceHandles {
  constructor() {
    this.version = "0.8.28";
  }

  build(options) {
    return startService().build(options).then(response => {
      this.handleResponse(response);
      return response;
    });
  }

  handleResponse(response) {
    if (response.error) {
      throw new Error(response.error);
    }
  }
}

const createErrorMessage = error => `Error: ${error.message}`;
const setChildProcessTimeout = (childProcess, timeout) => setTimeout(() => childProcess.kill(), timeout);

const serve = (serverOptions, buildOptions) => startService().serve(serverOptions, buildOptions);

exports.startService = startService;
exports.serve = serve;
exports.version = '0.8.28';

function randomFileName() {
  return join(tmpdir(), `esbuild-${randomBytes(32).toString("hex")}`);
}

