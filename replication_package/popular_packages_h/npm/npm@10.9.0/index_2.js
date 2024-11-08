const executeIfMain = () => {
  const isMainModule = require.main === module;

  if (isMainModule) {
    const cli = require('./lib/cli.js');
    cli(process);
  } else {
    throw new Error('The programmatic API was removed in npm v8.0.0');
  }
};

executeIfMain();
