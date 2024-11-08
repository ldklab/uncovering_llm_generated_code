// Import the 'Buffer' from 'safer-buffer' package
const { Buffer } = require('safer-buffer');

// Usage example of creating a new buffer
const exampleBuffer = Buffer.from('Hello, World!', 'utf8');

// Output the contents of the buffer
console.log(exampleBuffer.toString());
