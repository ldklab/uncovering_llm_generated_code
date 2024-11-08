js
// index.js
const { Command } = require('commander');

const cli = new Command();

cli
  .version('1.0.0')
  .name('string-util')
  .description('CLI to some JavaScript string utilities');

// Adding a 'split' command
cli
  .command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<text>', 'text to be split')
  .option('--first', 'get only the first substring')
  .option('-s, --separator <character>', 'character used to separate substrings', ',')
  .action((text, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(text.split(options.separator, limit));
  });

// Parse and execute commands
cli.parse(process.argv);

// Examples to run:
// $ node index.js split --separator=/ x/y/z
// $ node index.js split --first --separator=/ x/y/z
