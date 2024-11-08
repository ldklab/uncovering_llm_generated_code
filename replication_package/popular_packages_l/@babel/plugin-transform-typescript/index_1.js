markdown
# Directory structure:
# .
# ├── package.json
# ├── babel.config.json
# └── src
#     └── main.ts

# package.json
{
  "name": "babel-ts-compiler",
  "version": "1.0.0",
  "description": "Compile TypeScript with Babel",
  "main": "dist/main.js",
  "scripts": {
    "compile": "babel src --out-dir dist"
  },
  "devDependencies": {
    "@babel/cli": "^7.21.3",
    "@babel/core": "^7.21.3",
    "@babel/plugin-transform-typescript": "^7.21.3",
    "@babel/preset-env": "^7.21.3"
  }
}

# babel.config.json
{
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": [
    "@babel/plugin-transform-typescript"
  ]
}

# src/main.ts
const message: string = "Hello World!";
console.log(message);

# Commands to execute
# Install dependencies
npm install

# This will compile TypeScript in `src/` to JavaScript in `dist/`
npm run compile
