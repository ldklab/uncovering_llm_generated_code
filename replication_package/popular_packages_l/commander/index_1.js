js
// index.js
const { Command } = require('commander');

const program = new Command();

program
  .version('1.0.0')
  .name('string-util')
  .description('CLI to some JavaScript string utilities');

program
  .command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .action((inputString, options) => {
    const splitLimit = options.first ? 1 : undefined;
    const result = inputString.split(options.separator, splitLimit);
    console.log(result);
  });

program.parse(process.argv);

// Usage examples:
// node index.js split --separator=/ a/b/c
// Output: [ 'a', 'b', 'c' ]
// node index.js split --first --separator=/ a/b/c
// Output: [ 'a' ]
