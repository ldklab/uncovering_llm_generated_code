markdown
// package.json
{
  "name": "color-name",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module"
}

// index.js
const colorName = {
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  black: [0, 0, 0],
  white: [255, 255, 255],
  gray: [128, 128, 128],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  // Additional colors could be included here following the CSS Color Module Level 4 specification
};

export default colorName;

// Usage Example
// Importing the module in a separate file or context
import colors from './index.js'; // Assuming the module is locally stored as index.js
console.log(colors.red); // Outputs: [255, 0, 0]
