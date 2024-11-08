js
// index.js
const { Command } = require('commander');

const program = new Command();

program
  .version('1.0.0')
  .name('string-util')
  .description('CLI to some JavaScript string utilities');

// Define a 'split' command
program
  .command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

// Parser and execute the input command
program.parse(process.argv);

// Usage examples (to test run using: node index.js ...inputs)
// $ node index.js split --separator=/ a/b/c
// [ 'a', 'b', 'c' ]
// $ node index.js split --first --separator=/ a/b/c
// [ 'a' ]
