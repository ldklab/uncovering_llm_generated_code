markdown
# Explanation
The Node.js project is configured to bundle JavaScript using Rollup. The project contains the following files: `package.json` for managing the dependencies and scripts, `rollup.config.js` to specify Rollup configurations, and `src/main.js` where a simple JavaScript module is defined.

**package.json**: 
- The project is named "my-rollup-package" and is at version 1.0.0.
- It includes a build script that runs Rollup with a configuration file.
- `rollup` is used as a development dependency.

**rollup.config.js**:
- This is the configuration file for Rollup.
- It specifies `src/main.js` as the entry point.
- The output is configured to generate bundles in three formats: IIFE (Immediately Invoked Function Expression), CommonJS, and UMD (Universal Module Definition).

**src/main.js**:
- Contains a simple ES module that exports a function `helloWorld`, which logs "Hello, world!" to the console.

To build the project, `npm install` is used to install dependencies, followed by `npm run build` which uses Rollup to create three bundled files: `bundle.iife.js`, `bundle.cjs.js`, and `bundle.umd.js` in the project root.

# Rewritten Code
- project/
  - source/
    - index.js
  - rollup.config.js
  - package.json

# File: package.json
{
  "name": "project",
  "version": "1.0.0",
  "description": "Example setup with Rollup",
  "main": "dist.js",
  "scripts": {
    "build": "rollup --config"
  },
  "devDependencies": {
    "rollup": "^3.0.0"
  }
}

# File: rollup.config.js
export default {
  input: 'source/index.js',
  output: [
    {
      file: 'dist.iife.js',
      format: 'iife',
      name: 'ProjectBundle'
    },
    {
      file: 'dist.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist.umd.js',
      format: 'umd',
      name: 'ProjectBundle'
    }
  ]
}

# File: source/index.js
// Example module
export function greet() {
  console.log('Hello from the project!');
}

# To Build:
# 1. Install dependencies: npm install
# 2. Run the build script: npm run build
# This generates: dist.iife.js, dist.cjs.js, dist.umd.js
