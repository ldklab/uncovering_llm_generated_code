const chalk = require('chalk');

// This function highlights various parts of JavaScript code using Chalk to color them.
function highlight(jsCode) {
  // Regular expressions for identifying different components in the code
  const keywords = /\b(function|return|if|else|var|let|const|for|while|break|continue)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g;
  const numbers = /\b\d+(\.\d+)?\b/g;
  const booleans = /\b(true|false|null|undefined)\b/g;

  // Apply color transformations using Chalk for readability
  return jsCode
    .replace(comments, chalk.gray('$1'))           // Comments are colored gray
    .replace(strings, chalk.green('$&'))           // String literals are colored green
    .replace(keywords, chalk.cyan('$1'))           // Keywords are colored cyan
    .replace(numbers, chalk.magenta('$&'))         // Numbers are colored magenta
    .replace(booleans, chalk.yellow('$1'));        // Boolean values and null/undefined are colored yellow
}

// Example usage of the highlight function on a sample piece of JavaScript code
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

// Outputs the highlighted code to the console
console.log(highlight(exampleCode));
