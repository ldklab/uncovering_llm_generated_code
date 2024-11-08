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

expect.extend(matchers);

// Usage example
(async function testSuite() {
  // This setup is typically done in a dedicated test file
  // Setup some HTML content in the document for testing purposes
  document.body.innerHTML = `
    <button type="button" disabled>Click me</button>
    <div style="display:none;">Invisible</div>
  `;
  
  const button = document.querySelector('button');
  const hiddenDiv = document.querySelector('div');

  expect(button).toBeDisabled();
  expect(button).not.toBeEnabled();
  expect(hiddenDiv).not.toBeVisible();
  expect(button).toBeInTheDocument();
})(); 
