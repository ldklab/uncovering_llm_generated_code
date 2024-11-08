// fs-minipass-v2.js

const { EventEmitter } = require('events');
const fs = require('fs');
const Minipass = require('minipass');

class FsMinipassReadStream extends Minipass {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.readSize = options.readSize || 16 * 1024 * 1024;
        this.autoClose = options.autoClose !== false;
        this.fd = options.fd;

        if (this.fd) {
            process.nextTick(() => this._read());
        } else {
            fs.open(this.path, 'r', (err, fd) => {
                if (err) this.emit('error', err);
                else {
                    this.fd = fd;
                    this._read();
                }
            });
        }
    }

    _read() {
        const buffer = Buffer.allocUnsafe(this.readSize);
        fs.read(this.fd, buffer, 0, this.readSize, null, (err, bytesRead) => {
            if (err) this.emit('error', err);
            else if (bytesRead > 0) {
                this.write(buffer.slice(0, bytesRead));
                this._read();
            } else {
                this.end();
                if (this.autoClose) this._close();
            }
        });
    }

    _close() {
        if (this.fd) fs.close(this.fd, () => this.emit('close'));
    }
}

class FsMinipassReadStreamSync extends Minipass {
    constructor(path, options = {}) {
        super();
        this.fd = options.fd || fs.openSync(path, 'r');
        const size = options.size || fs.fstatSync(this.fd).size;
        const buffer = Buffer.allocUnsafe(size);
        
        const bytesRead = fs.readSync(this.fd, buffer, 0, size, null);
        this.write(buffer.slice(0, bytesRead));
        this.end();
        
        if (options.autoClose !== false) fs.closeSync(this.fd);
    }
}

class FsMinipassWriteStream extends Minipass {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.flags = options.flags || 'w';
        this.mode = options.mode || 0o666;
        this.start = options.start || 0;
        this.autoClose = options.autoClose !== false;
        this.fd = options.fd;

        if (!this.fd) {
            fs.open(this.path, this.flags, this.mode, (err, fd) => {
                if (err) this.emit('error', err);
                else {
                    this.fd = fd;
                    this._writeBuffer();
                }
            });
        }

        this.on('data', chunk => this._writeChunk(chunk));
        this.on('end', () => this._end());
    }

    _writeChunk(chunk) {
        if (this.fd) {
            fs.write(this.fd, chunk, 0, chunk.length, this.start, err => {
                if (err) this.emit('error', err);
            });
        }
    }

    _end() {
        if (this.autoClose && this.fd) {
            fs.close(this.fd, err => {
                if (err) this.emit('error', err);
                else this.emit('close');
            });
            this.fd = null;
        }
    }
}

class FsMinipassWriteStreamSync extends Minipass {
    constructor(path, options = {}) {
        super();
        this.fd = options.fd || fs.openSync(path, options.flags || 'w', options.mode || 0o666);
    }

    write(chunk) {
        fs.writeSync(this.fd, chunk, 0, chunk.length);
        return true;
    }

    end() {
        if (this.fd) fs.closeSync(this.fd);
        super.end();
    }
}

module.exports = {
    ReadStream: FsMinipassReadStream,
    ReadStreamSync: FsMinipassReadStreamSync,
    WriteStream: FsMinipassWriteStream,
    WriteStreamSync: FsMinipassWriteStreamSync
};
