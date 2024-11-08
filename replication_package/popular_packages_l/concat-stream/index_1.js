const { Writable } = require('stream');

function concatStream(opts, cb) {
  if (typeof opts === 'function') { // If the first argument is the callback
    cb = opts; // Assign it to cb
    opts = {}; // Set opts to an empty object
  }

  let dataChunks = []; // Array to store data chunks
  let encodingType = opts.encoding; // Retrieve encoding from options
  
  const writableStream = new Writable({ // Create a writable stream 
    objectMode: true, // Allow objects to be written into the stream
    write(chunk, enc, next) { // Write function for the stream
      if (!encodingType) { // If encoding is not yet determined
        encodingType = determineEncoding(chunk); // Determine the encoding of the chunk
      }
      dataChunks.push(chunk); // Store the chunk
      next(); // Signal completion of the write operation
    },
    final(callback) { // Finalize the writable stream
      const combinedData = mergeData(dataChunks, encodingType); // Concatenate data based on encoding
      cb(combinedData); // Pass result to callback
      callback(); // Signal completion of the finalization process
    }
  });

  return writableStream; // Return the writable stream
}

function determineEncoding(chunk) {
  if (Buffer.isBuffer(chunk)) return 'buffer'; // Check if chunk is a Buffer
  if (typeof chunk === 'string') return 'string'; // Check if chunk is a string
  if (Array.isArray(chunk)) return 'array'; // Check if chunk is an array
  if (chunk instanceof Uint8Array) return 'uint8array'; // Check if chunk is a Uint8Array
  return 'object'; // Default to 'object' for other types
}

function mergeData(data, encoding) {
  switch (encoding) {
    case 'string':
      return data.join(''); // Concatenate strings
    case 'buffer':
      return Buffer.concat(data.map(item => Buffer.isBuffer(item) ? item : Buffer.from(item))); // Concatenate buffers
    case 'array':
      return data.flat(); // Flatten and concatenate arrays
    case 'uint8array':
      const totalLength = data.reduce((sum, item) => sum + item.length, 0); // Calculate total length
      const mergedArray = new Uint8Array(totalLength);
      let offset = 0;
      data.forEach(item => {
        item = item instanceof Uint8Array ? item : Uint8Array.from(Buffer.from(item)); // Convert if necessary
        mergedArray.set(item, offset);
        offset += item.length;
      });
      return mergedArray; // Return concatenated Uint8Array
    case 'object':
      return data; // Return objects as-is
    default:
      return Buffer.concat(data.map(item => Buffer.from(item))); // Default to concatenating as buffers
  }
}

module.exports = concatStream;
