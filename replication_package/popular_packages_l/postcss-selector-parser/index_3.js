// Import the postcss-selector-parser module
const parser = require('postcss-selector-parser');

// Function to transform selectors with the specified action
const transform = selectors => {
    selectors.walk(selector => {
        console.log(String(selector)); // Log each selector
    });
};

// Example of synchronous selector transformation and processing
const processedSyncSelectors = parser(transform).processSync('h1, h2, h3');
console.log('Transformed (Synchronous):', processedSyncSelectors);

// Function to normalize selectors by removing unnecessary whitespace
const normalizeSelectors = (selectorString) => {
    return parser().processSync(selectorString, { lossless: false });
};

// Demonstrating the normalization of selectors
const normalizedSelectors = normalizeSelectors('h1, h2, h3');
console.log('Normalized:', normalizedSelectors);

// Asynchronous processing of selectors with error handling
const asyncProcess = async (selectorString) => {
    try {
        const processedResult = await parser().process(selectorString);
        console.log('Async Processed Result:', processedResult);
    } catch (error) {
        console.error('Error in async processing:', error);
    }
};

// Example invocation of asynchronous selector processing
asyncProcess('div, span, a');
