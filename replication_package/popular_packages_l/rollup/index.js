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
