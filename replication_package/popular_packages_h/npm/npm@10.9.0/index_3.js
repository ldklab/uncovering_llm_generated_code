if (require.main === module) {
  const cli = require('./lib/cli.js');
  cli(process);
} else {
  throw new Error('The programmatic API was removed in npm v8.0.0');
}
