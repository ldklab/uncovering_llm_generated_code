// color.js
export const lighten = (percentage) => (color) => {
  console.log(`Lightening ${color} by ${percentage * 100}%`);
  return color;
};

export const desaturate = (percentage) => (color) => {
  console.log(`Desaturating ${color} by ${percentage * 100}%`);
  return color;
};

// animation.js
export const animation = (keyframes) => {
  console.log('Creating animation with keyframes:', keyframes);
  return `animation: ${keyframes};`;
};

// layout.js
export const clearFix = () => {
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
export const compose = (...fns) => (initial) =>
  fns.reduceRight((v, f) => f(v), initial);

// index.js
export { lighten, desaturate } from './color';
export { animation } from './animation';
export { clearFix } from './layout';
export { compose } from './compose';

// Example Usage
const { compose, lighten, desaturate } = require('./index');

const tone = compose(lighten(0.1), desaturate(0.1));
console.log(tone('#FF0000'));

// Re-export functions
module.exports = {
  lighten,
  desaturate,
  animation,
  clearFix,
  compose
};
