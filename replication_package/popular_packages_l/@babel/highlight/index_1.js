const chalk = require('chalk');

// The function "highlight" takes a string of JavaScript code and applies syntax highlighting to it.
function highlight(jsCode) {
  // Regular expressions to match different types of JavaScript syntax:
  const keywords = /\b(function|return|if|else|var|let|const|for|while|break|continue)\b/g;  // JavaScript keywords
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;  // String literals (enclosed by "", '', or ``)
  const comments = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g;  // Single-line (//) and multi-line (/* */) comments
  const numbers = /\b\d+(\.\d+)?\b/g;  // Numbers (including integers and decimals)
  const booleans = /\b(true|false|null|undefined)\b/g;  // Boolean values and null/undefined

  // Replace matched syntax elements with colored versions using "chalk":
  return jsCode
    .replace(comments, chalk.gray('$1'))           // Comments are colored gray
    .replace(strings, chalk.green('$&'))           // Strings are colored green
    .replace(keywords, chalk.cyan('$1'))           // Keywords are colored cyan
    .replace(numbers, chalk.magenta('$&'))         // Numbers are colored magenta
    .replace(booleans, chalk.yellow('$1'));        // Booleans/null/undefined are colored yellow
}

// Example usage of the "highlight" function:
const exampleCode = `
// This is a sample JavaScript code
function greet(name) {
  if (name) {
    return 'Hello, ' + name + '!';
  } else {
    return 'Hello, World!';
  }
}
console.log(greet('Babel'));
`;

// Output the highlighted JavaScript code to the console.
console.log(highlight(exampleCode));
