// color.js
export const lighten = (percentage) => (color) => {
  // Example implementation
  console.log(`Lightening ${color} by ${percentage * 100}%`);
  // Would typically return a new color, this is a placeholder
  return color;
};

export const desaturate = (percentage) => (color) => {
  // Example implementation
  console.log(`Desaturating ${color} by ${percentage * 100}%`);
  // Would typically return a new color, this is a placeholder
  return color;
};

// animation.js
export const animation = (keyframes) => {
  console.log('Creating animation with keyframes:', keyframes);
  // Return animation CSS as string (simplified)
  return `animation: ${keyframes};`;
};

// layout.js
export const clearFix = () => {
  console.log('Applying clearfix');
  // Return clearfix CSS as string (simplified)
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
console.log(tone('#FF0000')); // Example color

module.exports = {
  lighten,
  desaturate,
  animation,
  clearFix,
  compose
};
