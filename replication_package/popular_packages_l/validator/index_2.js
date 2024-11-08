// validator.js
function isEmail(str) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(str);
}

function isAlpha(str, locale = 'en-US', options = {}) {
  let baseRegex;

  // Default locale is set to 'en-US', which is currently the only implemented locale.
  if (locale === 'en-US') {
    baseRegex = /^[A-Za-z]+$/;
  } else {
    baseRegex = /^[A-Za-z]+$/; // Defaults to 'en-US' if locale isn't recognized.
  }

  // Extend base regex if 'ignore' option is provided
  let regex = baseRegex;
  if (options.ignore) {
    const ignoreRegex = `[${options.ignore.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`; // Escape special regex characters
    regex = new RegExp(`${baseRegex.source.replace(']+$', '')}${ignoreRegex}]+$`);
  }

  return regex.test(str);
}

function isNumeric(str, options = { no_symbols: false }) {
  const regex = options.no_symbols ? /^[0-9]+$/ : /^[+-]?\d+(\.\d+)?$/;
  return regex.test(str);
}

// Example usage:
console.log(isEmail('test@example.com')); // true
console.log(isAlpha('hello', 'en-US')); // true
console.log(isNumeric('123')); // true

// To use as a module in Node.js
module.exports = {
  isEmail,
  isAlpha,
  isNumeric
};
