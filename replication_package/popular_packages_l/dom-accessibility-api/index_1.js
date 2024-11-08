// index.js

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Computes the accessible name for a given DOM element by checking attributes commonly used for accessibility.
 * @param {HTMLElement} element - The DOM element for which to compute the accessible name.
 * @return {string} - The computed accessible name of the element, or an empty string if no applicable method is found.
 */
function computeAccessibleName(element) {
    if (!element) return '';

    // Determine accessible name based on attributes and element content
    return element.getAttribute('aria-label') 
        || element.getAttribute('aria-labelledby') 
        || element.textContent.trim();
}

/**
 * Computes the accessible description for a given DOM element by checking attributes commonly used for accessibility.
 * @param {HTMLElement} element - The DOM element for which to compute the accessible description.
 * @return {string} - The computed accessible description or a default message if none is found.
 */
function computeAccessibleDescription(element) {
    if (!element) return '';

    // Determine accessible description based on attributes
    return element.getAttribute('aria-describedby') || 'No description available';
}

// Exporting the functions for use in other modules
module.exports = {
    computeAccessibleName,
    computeAccessibleDescription
};

// Demonstrating the functions with an example HTML element setup
const exampleHtml = `
<div id="myButton" aria-label="Submit Button">Button</div>
`;

const dom = new JSDOM(exampleHtml);
const element = dom.window.document.getElementById('myButton');

console.log(computeAccessibleName(element)); // Expected output: 'Submit Button'
console.log(computeAccessibleDescription(element)); // Expected output: 'No description available'
