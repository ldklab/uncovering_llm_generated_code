// Import necessary modules
const parser = require('postcss-selector-parser');

// Function to transform selectors by walking and logging each one
const transformSelectors = (selectors) => {
    selectors.walk(selector => {
        console.log(String(selector)); // Print out each selector node
    });
};

// Synchronous processing and transformation example
const syncedTransformation = parser(transformSelectors).processSync('h1, h2, h3');
console.log('Transformed (Synchronous):', syncedTransformation);

// Function to normalize selectors by removing unnecessary whitespace
const normalizeSelectorString = (selectors) => {
    return parser().processSync(selectors, { lossless: false });
};

// Example usage of the normalization function
const normalizedOutput = normalizeSelectorString('h1, h2, h3');
console.log('Normalized:', normalizedOutput);

// Asynchronous processing of selectors example
const processAsyncSelectors = async (selectorString) => {
    try {
        const processedResult = await parser().process(selectorString);
        console.log('Async Processed Result:', processedResult);
    } catch (error) {
        console.error('Error in async processing:', error);
    }
};

// Example usage of the asynchronous processing function
processAsyncSelectors('div, span, a');
