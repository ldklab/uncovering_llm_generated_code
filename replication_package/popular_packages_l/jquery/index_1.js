// Install jsdom and jquery packages using npm
// npm install jsdom jquery

const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<!DOCTYPE html><p>Hello world</p>'); // Setting up a virtual DOM environment
const $ = require('jquery')(window); // Load jQuery with the virtual DOM

// Using jQuery functionality in a Node.js environment
$(function() {
    console.log('The document is ready!'); // Notify when the document is ready
    $('p').text('Hello from jQuery, running in Node.js with jsdom!'); // Modify the text inside the paragraph element
    console.log($('p').text()); // Log the modified paragraph text
});

// Note: Ensure the required packages are installed before executing this script
```