const chalk = require('chalk');

function highlight(jsCode) {
  const keywords = /\b(function|return|if|else|var|let|const|for|while|break|continue)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g;
  const numbers = /\b\d+(\.\d+)?\b/g;
  const booleans = /\b(true|false|null|undefined)\b/g;

  return jsCode
    .replace(comments, chalk.gray('$1'))           // color comments in gray
    .replace(strings, chalk.green('$&'))           // color strings in green
    .replace(keywords, chalk.cyan('$1'))           // color keywords in cyan
    .replace(numbers, chalk.magenta('$&'))         // color numbers in magenta
    .replace(booleans, chalk.yellow('$1'));        // color booleans in yellow
}

// Example usage:
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

console.log(highlight(exampleCode));
