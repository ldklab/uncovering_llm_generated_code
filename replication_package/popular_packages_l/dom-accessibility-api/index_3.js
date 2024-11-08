// Updated index.js with clearer structure and additional comments

const { JSDOM } = require("jsdom");

/**
 * Computes the accessible name attribute for a DOM element.
 * It first tries to retrieve the 'aria-label' attribute.
 * If 'aria-label' is not defined, it uses the 'aria-labelledby' attribute.
 * If neither are defined, it defaults to trim()med text content of the element.
 *
 * @param {HTMLElement} element - The DOM element for which to compute the accessible name.
 * @return {string} - The computed accessible name for the element.
 */
function computeAccessibleName(element) {
  if (!element) return '';

  // Try to retrieve 'aria-label', then 'aria-labelledby', else fallback to textContent.
  return element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || element.textContent.trim();
}

/**
 * Computes the accessible description for a DOM element.
 * It primarily looks for the element's 'aria-describedby' attribute.
 * If this attribute is not present, it returns a default message.
 *
 * @param {HTMLElement} element - The DOM element for which to compute the accessible description.
 * @return {string} - The computed accessible description for the element.
 */
function computeAccessibleDescription(element) {
  if (!element) return '';

  // Use 'aria-describedby' for the description, else default message.
  return element.getAttribute('aria-describedby') || 'No description available';
}

// Export the functions so they can be used elsewhere
module.exports = {
  computeAccessibleName,
  computeAccessibleDescription,
};

// Example usage: simulate how these functions might be used in a context
// Create a DOM from sample HTML string and fetch the element by ID
const exampleHtml = `
<div id="myButton" aria-label="Submit Button">Button</div>
`;

const dom = new JSDOM(exampleHtml);
const element = dom.window.document.getElementById('myButton');

// Log the computed accessible name and description of the element
console.log(computeAccessibleName(element)); // Outputs: "Submit Button"
console.log(computeAccessibleDescription(element)); // Outputs: "No description available"
