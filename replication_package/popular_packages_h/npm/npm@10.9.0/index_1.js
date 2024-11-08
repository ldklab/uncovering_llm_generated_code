const isDirectlyRun = () => require.main === module;

const executeCli = () => {
  try {
    require('./lib/cli.js')(process);
  } catch (err) {
    console.error('Error executing CLI:', err);
    process.exit(1);
  }
};

const checkAndRun = () => {
  if (isDirectlyRun()) {
    executeCli();
  } else {
    throw new Error('The programmatic API was removed in npm v8.0.0');
  }
};

checkAndRun();
