// Ensure you have jsdom and cheerio packages installed before running this script.
// Use the command: npm install jsdom cheerio

const { JSDOM } = require('jsdom'); // Import the JSDOM class from the jsdom package
const cheerio = require('cheerio'); // Import cheerio, a library for DOM manipulation

// Create a new JSDOM instance with initial HTML content, simulating a browser environment
const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');
const $ = cheerio.load(dom.window.document); // Load the virtual DOM using cheerio for DOM manipulation

// Example usage of Cheerio in Node.js
console.log('The document is ready!'); // Log a message to indicate the document is ready
$('p').text('Hello from Cheerio, running in Node.js with jsdom!'); // Change the text of the paragraph element
console.log($('p').text()); // Log the text of the paragraph element; should output: Hello from Cheerio, running in Node.js with jsdom!
```
