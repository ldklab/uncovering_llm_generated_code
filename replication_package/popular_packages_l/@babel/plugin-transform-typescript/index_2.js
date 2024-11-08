json
// package.json
{
  "name": "babel-typescript-transform",
  "version": "1.0.0",
  "description": "Transform TypeScript using Babel",
  "main": "dist/index.js",
  "scripts": {
    "build": "babel src --out-dir dist"
  },
  "devDependencies": {
    "@babel/cli": "^7.21.3",
    "@babel/core": "^7.21.3",
    "@babel/plugin-transform-typescript": "^7.21.3",
    "@babel/preset-env": "^7.21.3"
  }
}

// babel.config.json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-transform-typescript"]
}

// src/index.ts
const greeting: string = "Hello, TypeScript!";
console.log(greeting);

// Commands to install dependencies and build the project
// Install the project's dependencies
// $ npm install
//
// Compile TypeScript files in `src/` to JavaScript in `dist/` directory
// $ npm run build
