// Import the PostCSS Selector Parser module
const parser = require('postcss-selector-parser');

// Function to handle transformation of selectors
const transform = selectors => {
    // Walk through each selector node and log it
    selectors.walk(selector => {
        console.log(String(selector));
    });
};

// Synchronous processing where selectors are transformed
const transformed = parser(transform).processSync('h1, h2, h3');
console.log('Transformed (Synchronous):', transformed);

// Function to normalize selector strings by removing extra spaces
const normalizeSelectors = (selectorString) => {
    // Process the string in a lossless way to normalize
    return parser().processSync(selectorString, { lossless: false });
};

// Example of normalizing selectors
const normalized = normalizeSelectors('h1, h2, h3');
console.log('Normalized:', normalized);

// Asynchronous function to process selector strings
const asyncProcess = async (selectorString) => {
    try {
        // Await processing of the selector string
        const result = await parser().process(selectorString);
        console.log('Async Processed Result:', result);
    } catch (error) {
        console.error('Error in async processing:', error);
    }
};

// Example usage of the asynchronous processing function
asyncProcess('div, span, a');
