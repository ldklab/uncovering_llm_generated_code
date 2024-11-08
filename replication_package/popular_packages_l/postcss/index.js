// package.json
{
  "name": "postcss-custom-package",
  "version": "1.0.0",
  "description": "A simple PostCSS setup for transforming CSS with plugins.",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "postcss": "^8.3.6",
    "autoprefixer": "^10.3.1",
    "postcss-import": "^14.0.2",
    "postcss-mixins": "^7.0.3",
    "postcss-nested": "^5.0.6",
    "postcss-simple-vars": "^6.0.3"
  }
}

// index.js
const fs = require('fs');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const postcssMixins = require('postcss-mixins');
const postcssNested = require('postcss-nested');
const postcssSimpleVars = require('postcss-simple-vars');

const cssInputFile = './input.css';
const cssOutputFile = './output.css';

const processCSS = async () => {
  try {
    const css = fs.readFileSync(cssInputFile, 'utf-8');
    const result = await postcss([
      postcssImport,
      postcssMixins,
      postcssSimpleVars,
      postcssNested,
      autoprefixer
    ]).process(css, { from: cssInputFile, to: cssOutputFile });

    fs.writeFileSync(cssOutputFile, result.css);
    if (result.map) {
      fs.writeFileSync(`${cssOutputFile}.map`, result.map.toString());
    }

    console.log('CSS processed successfully and saved to output.css');
  } catch (error) {
    console.error('Error processing CSS:', error);
  }
};

processCSS();

// input.css
/*
@import 'variables.css';

@mixin border-radius($radius) {
  border-radius: $radius;
}

.button {
  @include border-radius(5px);
  color: $primary-color;
  display: flex;
  &:hover {
    color: $secondary-color;
  }
}
*/

// variables.css
/*
$primary-color: #3498db;
$secondary-color: #2ecc71;
*/
