const ciInfo = require('ci-info');

function checkCIEnvironment() {
  if (ciInfo.isCI) {
    console.log(`The name of the CI server is: ${ciInfo.name}`);
  } else {
    console.log('This program is not running on a CI server');
  }
}

checkCIEnvironment();
```

In this rewritten code, the core functionality remains unchanged, but it is encapsulated within a function `checkCIEnvironment` for better organization, demonstrating a common refactoring practice to enhance code readability and maintainability. The function is immediately invoked to perform the CI environment check.