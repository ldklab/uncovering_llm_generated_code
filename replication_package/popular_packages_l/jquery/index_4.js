// Import necessary modules for simulating a browser environment in Node.js
const { JSDOM } = require('jsdom');

// Create a virtual DOM environment with a basic HTML structure
const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');

// Access the window and document from the virtual DOM created above
const { window } = dom;

// Initialize jQuery within the context of this virtual window
const $ = require('jquery')(window);

// Using jQuery to manipulate the DOM and output results
$(document).ready(() => {
  console.log('The document is ready!'); // Indicate that the document is fully loaded
  $('p').text('Hello from jQuery, running in Node.js with jsdom!'); // Change the text of the <p> element
  console.log($('p').text()); // Log the updated text content of the <p> element
});
```
