// jest-dom.js
const { matcherHint, printReceived } = require('jest-matcher-utils');

// Utility function to check element visibility
const isVisible = (element) => {
  if (!element || !(element instanceof Element) || element.hidden) return false;
  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
};

// Custom matcher implementation to extend Jest expectations
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
  
  // Additional matchers can be implemented here.
};

// Extend Jest with the custom matchers
expect.extend(matchers);

// Usage example (typically this would be inside a test file with a testing framework)
(async function testSuite() {
  // Setup test DOM - typically handled in the test setup phase in actual test files
  document.body.innerHTML = `
    <button type="button" disabled>Click me</button>
    <div style="display:none;">Invisible</div>
  `;
  
  const button = document.querySelector('button');
  const hiddenDiv = document.querySelector('div');

  expect(button).toBeDisabled();         // Test if button is disabled
  expect(button).not.toBeEnabled();      // Test if button is not enabled
  expect(hiddenDiv).not.toBeVisible();   // Test if hiddenDiv is not visible
  expect(button).toBeInTheDocument();    // Test if button is in the document
})();
