markdown
# Explanation of Original Code
The original Node.js code is setting up a simple build system using Rollup, a module bundler for JavaScript. The project structure includes the source file in `src/main.js`. The entry point of the project is `main.js`, which exports a `helloWorld` function. The Rollup build configuration, specified in `rollup.config.js`, defines three different output formats for the bundled code: IIFE (Immediately Invoked Function Expression), CJS (CommonJS), and UMD (Universal Module Definition). The build process is triggered by the `build` script in `package.json` using the Rollup library specified in `devDependencies`.

# Possible Rewritten Code

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
  input: 'src/main.js',
  output: [
    {
      file: 'bundle.iife.js',
      format: 'iife',
      name: 'MyBundle'
    },
    {
      file: 'bundle.cjs.js',
      format: 'cjs'
    },
    {
      file: 'bundle.umd.js',
      format: 'umd',
      name: 'MyBundle'
    }
  ]
}

# File: src/main.js
// Example ES module
export function helloWorld() {
  console.log('Hello, world!');
}

# To Build:
# 1. Install dependencies: npm install
# 2. Run build script: npm run build
# This will generate three bundles: bundle.iife.js, bundle.cjs.js, bundle.umd.js
