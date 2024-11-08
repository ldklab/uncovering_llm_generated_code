const { JSDOM } = require('jsdom');

/**
 * Computes the accessible name for a given DOM element
 * @param {HTMLElement} element - The DOM element to compute the accessible name for
 * @return {string} - The computed accessible name
 */
function computeAccessibleName(element) {
    if (!element) return '';
    // Check aria-label, aria-labelledby or fallback to textContent
    return element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || element.textContent.trim();
}

/**
 * Computes the accessible description for a given DOM element
 * @param {HTMLElement} element - The DOM element to compute the accessible description for
 * @return {string} - The computed accessible description
 */
function computeAccessibleDescription(element) {
    if (!element) return '';
    // Use aria-describedby or provide a no description default
    return element.getAttribute('aria-describedby') || 'No description available';
}

// Export the functions for usage in other modules
module.exports = {
    computeAccessibleName,
    computeAccessibleDescription,
};

// Example HTML to test the functions
const exampleHtml = `
<div id="myButton" aria-label="Submit Button">Button</div>
`;

// Create a DOM using JSDOM to simulate a DOM environment in Node.js
const dom = new JSDOM(exampleHtml);
const element = dom.window.document.getElementById('myButton');

// Log the computed accessible name and description
console.log(computeAccessibleName(element));
console.log(computeAccessibleDescription(element));
