// validator.js
function isEmail(str) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(str);
}

function isAlpha(str, locale = 'en-US', options = {}) {
  let regex;
  switch (locale) {
    case 'en-US':
      regex = /^[A-Za-z]+$/;
      break;
    // Add cases for additional locales if necessary.
    default:
      regex = /^[A-Za-z]+$/; // Default regex for English alphabet characters.
  }

  if (options.ignore) {
    regex = new RegExp(`^[${regex.source}${options.ignore}]+$`);
  }

  return regex.test(str);
}

function isNumeric(str, options = { no_symbols: false }) {
  const regex = options.no_symbols ? /^[0-9]+$/ : /^[+-]?[0-9]+(\.[0-9]+)?$/;
  return regex.test(str);
}

// Example usage:
console.log(isEmail('test@example.com')); // true
console.log(isAlpha('hello', 'en-US')); // true
console.log(isNumeric('123')); // true

// Exporting as a module for use in other files
module.exports = {
  isEmail,
  isAlpha,
  isNumeric
};
