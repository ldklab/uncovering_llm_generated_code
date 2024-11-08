// Import necessary modules
const parser = require('postcss-selector-parser');

// Function to transform selectors by walking and logging each one
const transform = selectors => {
    selectors.walk(selector => {
        console.log(String(selector)); // Perform desired action on each selector node
    });
};

// Synchronous processing example with transformation
const transformed = parser(transform).processSync('h1, h2, h3');
console.log('Transformed (Synchronous):', transformed);

// Function to normalize selectors, removing extra whitespace
const normalizeSelectors = (selectorString) => {
    return parser().processSync(selectorString, { lossless: false });
};

// Example usage of normalization
const normalized = normalizeSelectors('h1, h2, h3');
console.log('Normalized:', normalized);

// Asynchronous processing example
const asyncProcess = async (selectorString) => {
    try {
        const result = await parser().process(selectorString);
        console.log('Async Processed Result:', result);
    } catch (error) {
        console.error('Error in async processing:', error);
    }
};

// Example usage of asynchronous processing
asyncProcess('div, span, a');
