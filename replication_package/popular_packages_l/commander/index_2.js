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
  .action((stringToSplit, options) => {
    const separator = options.separator;
    const substrings = options.first ? stringToSplit.split(separator, 1) : stringToSplit.split(separator);
    console.log(substrings);
  });

program.parse(process.argv);
