// color.js
const lighten = (percentage) => (color) => {
  console.log(`Lightening ${color} by ${percentage * 100}%`);
  return color;
};

const desaturate = (percentage) => (color) => {
  console.log(`Desaturating ${color} by ${percentage * 100}%`);
  return color;
};

// animation.js
const animation = (keyframes) => {
  console.log('Creating animation with keyframes:', keyframes);
  return `animation: ${keyframes};`;
};

// layout.js
const clearFix = () => {
  console.log('Applying clearfix');
  return `
    &::after {
      content: "";
      display: table;
      clear: both;
    }
  `;
};

// compose.js
const compose = (...fns) => (initial) => 
  fns.reduceRight((v, f) => f(v), initial);

// index.js
module.exports = {
  lighten,
  desaturate,
  animation,
  clearFix,
  compose
};

// Example Usage
const { compose, lighten, desaturate } = require('./index');

const tone = compose(lighten(0.1), desaturate(0.1));
console.log(tone('#FF0000')); // Example color
