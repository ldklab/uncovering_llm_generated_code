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
  .option('-s, --separator <char>', 'separator character', ',')
  .option('--first', 'display just the first substring')
  .action((string, options) => {
    const separator = options.separator || ',';
    const limit = options.first ? 1 : undefined;
    console.log(string.split(separator, limit));
  });

program.parse(process.argv);
