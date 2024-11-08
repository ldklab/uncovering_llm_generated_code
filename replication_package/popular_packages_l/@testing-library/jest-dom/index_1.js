// jest-dom.js
const { matcherHint, printReceived } = require('jest-matcher-utils');

// Utility function to check element visibility
const isVisible = (element) => {
  if (!element || !(element instanceof Element) || element.hidden) return false;
  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
};

// Custom matcher implementation
const matchers = {
  toBeDisabled(element) {
    const isDisabled = element.disabled || element.closest('[disabled]');
    return {
      pass: Boolean(isDisabled),
      message: () => matcherHint('.not.toBeDisabled', 'element', '') +
        '\n\n' + 'Received: ' + printReceived(element),
    };
  },
  toBeEnabled(element) {
    const isDisabled = element.disabled || element.closest('[disabled]');
    return {
      pass: !Boolean(isDisabled),
      message: () => matcherHint('.toBeEnabled', 'element', '') +
        '\n\n' + 'Received: ' + printReceived(element),
    };
  },
  toBeEmptyDOMElement(element) {
    return {
      pass: element.innerHTML.trim() === '',
      message: () => matcherHint('.not.toBeEmptyDOMElement', 'element', '') +
        '\n\n' + 'Received: ' + printReceived(element),
    };
  },
  toBeInTheDocument(element) {
    return {
      pass: document.body.contains(element),
      message: () => matcherHint('.not.toBeInTheDocument', 'element', '') +
        '\n\n' + 'Received: ' + printReceived(element),
    };
  },
  toBeVisible(element) {
    return {
      pass: isVisible(element),
      message: () => matcherHint('.not.toBeVisible', 'element', '') +
        '\n\n' + 'Received: ' + printReceived(element),
    };
  },
  // Implement more matchers as described in the README...
};

// Extend Jest's built-in matchers with custom matchers
expect.extend(matchers);

// Example of usage within a test suite
(async function testSuite() {
  // Assign HTML content to document body for testing purposes
  document.body.innerHTML = `
    <button type="button" disabled>Click me</button>
    <div style="display:none;">Invisible</div>
  `;
  
  // Select elements to verify their properties using custom matchers
  const button = document.querySelector('button');
  const hiddenDiv = document.querySelector('div');

  // Using the custom matchers to check element attributes and properties
  expect(button).toBeDisabled();      // Verify if the button element is disabled
  expect(button).not.toBeEnabled();   // Verify that the button is not enabled 
  expect(hiddenDiv).not.toBeVisible(); // Check that hiddenDiv is not visible
  expect(button).toBeInTheDocument(); // Confirm that button is in the document
})();
