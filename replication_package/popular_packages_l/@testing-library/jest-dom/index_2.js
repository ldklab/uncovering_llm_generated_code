// jest-dom.js
const { matcherHint, printReceived } = require('jest-matcher-utils');

// Utility function to check element visibility
const isElementVisible = (element) => {
  if (!element || !(element instanceof Element) || element.hidden) return false;
  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
};

// Custom matchers object containing various DOM matchers for testing
const customMatchers = {
  toBeDisabled(element) {
    const isDisabled = element.disabled || element.closest('[disabled]');
    return {
      pass: Boolean(isDisabled),
      message: () => 
        matcherHint('.not.toBeDisabled', 'element', '') + 
        '\n\n' + 
        'Received: ' + printReceived(element),
    };
  },
  toBeEnabled(element) {
    const isDisabled = element.disabled || element.closest('[disabled]');
    return {
      pass: !Boolean(isDisabled),
      message: () => 
        matcherHint('.toBeEnabled', 'element', '') + 
        '\n\n' + 
        'Received: ' + printReceived(element),
    };
  },
  toBeEmptyDOMElement(element) {
    return {
      pass: element.innerHTML.trim() === '',
      message: () => 
        matcherHint('.not.toBeEmptyDOMElement', 'element', '') + 
        '\n\n' + 
        'Received: ' + printReceived(element),
    };
  },
  toBeInTheDocument(element) {
    return {
      pass: document.body.contains(element),
      message: () => 
        matcherHint('.not.toBeInTheDocument', 'element', '') + 
        '\n\n' + 
        'Received: ' + printReceived(element),
    };
  },
  toBeVisible(element) {
    return {
      pass: isElementVisible(element),
      message: () => 
        matcherHint('.not.toBeVisible', 'element', '') + 
        '\n\n' + 
        'Received: ' + printReceived(element),
    };
  },
  // Additional matchers can be added here...
};

// Extend Jest's expect function with custom matchers
expect.extend(customMatchers);

// Example test suite to demonstrate matcher usage
(async function runTestSuite() {
  // Simulating a typical test environment setup
  document.body.innerHTML = `
    <button type="button" disabled>Click me</button>
    <div style="display:none;">Invisible</div>
  `;
  
  const buttonElement = document.querySelector('button');
  const hiddenDivElement = document.querySelector('div');

  expect(buttonElement).toBeDisabled();
  expect(buttonElement).not.toBeEnabled();
  expect(hiddenDivElement).not.toBeVisible();
  expect(buttonElement).toBeInTheDocument();
})();
