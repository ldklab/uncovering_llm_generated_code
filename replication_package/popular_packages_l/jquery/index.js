// Install jsdom and jquery packages using npm
// npm install jsdom jquery

const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<!DOCTYPE html><p>Hello world</p>'); // Creating a virtual window with jsdom
const $ = require('jquery')(window); // Initializing jQuery with the virtual window

// Example usage of jQuery in Node.js
$(document).ready(function() {
    console.log('The document is ready!');
    $('p').text('Hello from jQuery, running in Node.js with jsdom!');
    console.log($('p').text()); // Outputs: Hello from jQuery, running in Node.js with jsdom!
});

// Note: Run this script after installing the dependencies using npm
```

Explanation for the code:
- A `JSDOM` instance is created with some initial HTML content. This simulates a browser's window and document within Node.js.
- The `jquery` library is required and passed the `window` object from the `JSDOM` instance. This allows jQuery to interact with the virtual DOM as if it were interacting with a real document in a browser.
- A simple jQuery statement changes and logs the text of a paragraph (`<p>`) element, demonstrating jQuery's ability to manipulate DOM elements in this simulated environment.