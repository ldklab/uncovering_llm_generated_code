// Install jsdom and jquery packages using npm
// npm install jsdom jquery

const { JSDOM } = require('jsdom');

// Create a new JSDOM instance with an initial HTML document containing a <p> tag
const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');

// Extract the window object from the JSDOM instance
const { window } = dom;

// Initialize jQuery using the window object from JSDOM
const $ = require('jquery')(window);

// Demonstrate the use of jQuery in the Node.js environment using the virtual DOM
$(window.document).ready(function() {
    console.log('The document is ready!');

    // Change the text content of the <p> element in the virtual DOM
    $('p').text('Hello from jQuery, running in Node.js with jsdom!');

    // Output the updated text content of the <p> element to the console
    console.log($('p').text()); // Outputs: Hello from jQuery, running in Node.js with jsdom!
});

// Note: Run this script after installing the dependencies using npm
```