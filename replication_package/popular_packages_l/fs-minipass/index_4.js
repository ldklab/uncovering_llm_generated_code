// FsMinipass module uses Node.js's 'fs' module and 'minipass' to provide readable and writable streams.
// These streams abstract over asynchronous and synchronous file I/O operations.

const { EventEmitter } = require('events');  // Import EventEmitter for emitting events.
const fs = require('fs');                    // Node.js file system module.
const Minipass = require('minipass');        // Minipass used to create streams that work with data buffers.

class FsMinipassReadStream extends Minipass {
    constructor(path, options = {}) {
        super(); // Initialize Minipass.
        this.path = path;  // Store the file path.
        // Set read size or default to 16MB.
        this.readSize = options.readSize || 16 * 1024 * 1024;
        this.autoClose = options.autoClose !== false;  // Auto-close file when reading ends, default true.
        this.fd = options.fd;  // File descriptor.

        // Open file if no fd is provided.
        if (!this.fd) {
            fs.open(this.path, 'r', (err, fd) => {  // Open file asynchronously for reading.
                if (err) return this.emit('error', err);  // Emit error if opening fails.
                this.fd = fd;  // Save file descriptor.
                this._read();  // Start the read process.
            });
        } else {
            process.nextTick(() => this._read());  // Schedule reading if fd is provided.
        }
    }

    _read() {
        const buffer = Buffer.allocUnsafe(this.readSize);  // Allocate buffer for file data.
        // Asynchronously read from file.
        fs.read(this.fd, buffer, 0, this.readSize, null, (err, bytesRead) => {
            if (err) return this.emit('error', err);  // Emit error if reading fails.
            if (bytesRead > 0) {  // If read data exists.
                this.write(buffer.slice(0, bytesRead));  // Write data to the stream.
                this._read();  // Continue reading recursively.
            } else {  
                this.end();  // End stream when no more data.
                if (this.autoClose) this._close();  // Close file if autoClose is true.
            }
        });
    }

    _close() {
        if (this.fd) fs.close(this.fd, () => this.emit('close'));  // Close file and emit 'close' event.
    }
}

class FsMinipassReadStreamSync extends Minipass {
    constructor(path, options = {}) {
        super();
        this.fd = options.fd || fs.openSync(path, 'r');  // Open file synchronously if fd not provided.
        let bytesRead;
        const buffer = Buffer.allocUnsafe(options.size || fs.fstatSync(this.fd).size); // Allocate appropriate buffer size.
        
        bytesRead = fs.readSync(this.fd, buffer, 0, buffer.length, null);  // Read file synchronously.
        this.write(buffer.slice(0, bytesRead));  // Write read data to stream.
        this.end();  // End stream.
        
        if (options.autoClose !== false) fs.closeSync(this.fd);  // Close file if autoClose not set to false.
    }
}

class FsMinipassWriteStream extends Minipass {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.flags = options.flags || 'w';  // File open mode.
        this.mode = options.mode || 0o666;  // File permission.
        this.start = options.start || 0;  // File write position.
        this.autoClose = options.autoClose !== false;  // Auto-close when writing ends.
        this.fd = options.fd;

        if (!this.fd) {
            // Asynchronously open file if fd not provided.
            fs.open(this.path, this.flags, this.mode, (err, fd) => {
                if (err) return this.emit('error', err);
                this.fd = fd;
                this._writeBuffer();  // Ready to write.
            });
        }

        this.on('data', chunk => this._writeChunk(chunk));  // Listen to data events and write chunks to file.
        this.on('end', () => this._end());  // Listen to end event.
    }

    _writeChunk(chunk) {
        if (!this.fd) return;
        // Asynchronously write chunk to file.
        fs.write(this.fd, chunk, 0, chunk.length, this.start, err => {
            if (err) this.emit('error', err);
        });
    }

    _end() {
        // Close file on stream end if autoClose is true.
        if (this.autoClose && this.fd) {
            fs.close(this.fd, err => {
                if (err) this.emit('error', err);
                this.emit('close');
            });
            this.fd = null;
        }
    }
}

class FsMinipassWriteStreamSync extends Minipass {
    constructor(path, options = {}) {
        super();
        // Synchronously open file for writing.
        this.fd = options.fd || fs.openSync(path, options.flags || 'w', options.mode || 0o666);
    }

    write(chunk) {
        fs.writeSync(this.fd, chunk, 0, chunk.length);  // Synchronously write chunk.
        return true;
    }

    end() {
        if (this.fd) fs.closeSync(this.fd);  // Synchronously close file.
        super.end();  // End stream.
    }
}

module.exports = {
    ReadStream: FsMinipassReadStream,
    ReadStreamSync: FsMinipassReadStreamSync,
    WriteStream: FsMinipassWriteStream,
    WriteStreamSync: FsMinipassWriteStreamSync
};  // Export the classes as module interfaces.
