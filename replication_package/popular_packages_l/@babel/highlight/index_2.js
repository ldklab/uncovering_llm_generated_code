const chalk = require('chalk');

function highlightCode(jsCode) {
  const patterns = {
    keywords: /\b(function|return|if|else|var|let|const|for|while|break|continue)\b/g,
    strings: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    comments: /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g,
    numbers: /\b\d+(\.\d+)?\b/g,
    booleans: /\b(true|false|null|undefined)\b/g
  };

  return jsCode
    .replace(patterns.comments, chalk.gray('$1'))     // Gray for comments
    .replace(patterns.strings, chalk.green('$&'))     // Green for strings
    .replace(patterns.keywords, chalk.cyan('$1'))     // Cyan for keywords
    .replace(patterns.numbers, chalk.magenta('$&'))   // Magenta for numbers
    .replace(patterns.booleans, chalk.yellow('$1'));  // Yellow for booleans
}

// Example usage:
const sampleCode = `
// Sample JavaScript code
function sayHello(person) {
  if (person) {
    return 'Hello, ' + person + '!';
  } else {
    return 'Hello, World!';
  }
}
console.log(sayHello('JavaScript'));
`;

console.log(highlightCode(sampleCode));
