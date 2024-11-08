const { exec } = require('child_process');

// Install the safe-regex-test package programmatically
exec('npm install --save safe-regex-test', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing safe-regex-test: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  console.log(`stdout: ${stdout}`);
  
  // After installation, require the package
  const safeRegexTest = require('safe-regex-test');

  // Example usage of safe-regex-test
  const regex = /([a-z]+)+/;
  const safeTest = safeRegexTest(regex);

  if (safeTest) {
    console.log('The regex is safe!');
  } else {
    console.log('The regex might be unsafe!');
  }
});
