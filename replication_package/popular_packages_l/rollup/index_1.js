markdown
# File Structure
- my-rollup-package/
  - src/
    - main.js
  - rollup.config.js
  - package.json

# File: package.json
{
  "name": "my-rollup-package",
  "version": "1.0.0",
  "description": "A simple Rollup setup example",
  "main": "bundle.js",
  "scripts": {
    "build": "rollup -c"
  },
  "devDependencies": {
    "rollup": "^3.0.0"
  }
}

# File: rollup.config.js
export default {
  input: 'src/main.js', // Entry point for the bundle
  output: [
    {
      file: 'bundle.iife.js', // Output the bundle in IIFE format
      format: 'iife',
      name: 'MyBundle' // Specify the global variable name for the IIFE bundle
    },
    {
      file: 'bundle.cjs.js', // Output the bundle in CommonJS format
      format: 'cjs'
    },
    {
      file: 'bundle.umd.js', // Output the bundle in UMD format
      format: 'umd',
      name: 'MyBundle' // Specify the global variable name for the UMD bundle
    }
  ]
}

# File: src/main.js
// Example ES module exported function
export function helloWorld() {
  console.log('Hello, world!');
}

// To Build:
// 1. Install dependencies using npm install
// 2. Run the build script using npm run build
// This setup will generate three types of bundles: IIFE, CommonJS, and UMD.
