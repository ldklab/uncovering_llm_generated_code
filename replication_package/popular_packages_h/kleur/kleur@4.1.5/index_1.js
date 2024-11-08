'use strict';

// Initialize variables related to environment and terminal properties
let FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY = true;
if (typeof process !== 'undefined') {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}

// Create an object to hold the styling methods
const styles = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
    FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY
  ),

  // Text style methods
  reset: createStyleMethod(0, 0),
  bold: createStyleMethod(1, 22),
  dim: createStyleMethod(2, 22),
  italic: createStyleMethod(3, 23),
  underline: createStyleMethod(4, 24),
  inverse: createStyleMethod(7, 27),
  hidden: createStyleMethod(8, 28),
  strikethrough: createStyleMethod(9, 29),

  // Text color methods
  black: createStyleMethod(30, 39),
  red: createStyleMethod(31, 39),
  green: createStyleMethod(32, 39),
  yellow: createStyleMethod(33, 39),
  blue: createStyleMethod(34, 39),
  magenta: createStyleMethod(35, 39),
  cyan: createStyleMethod(36, 39),
  white: createStyleMethod(37, 39),
  gray: createStyleMethod(90, 39),
  grey: createStyleMethod(90, 39),

  // Background color methods
  bgBlack: createStyleMethod(40, 49),
  bgRed: createStyleMethod(41, 49),
  bgGreen: createStyleMethod(42, 49),
  bgYellow: createStyleMethod(43, 49),
  bgBlue: createStyleMethod(44, 49),
  bgMagenta: createStyleMethod(45, 49),
  bgCyan: createStyleMethod(46, 49),
  bgWhite: createStyleMethod(47, 49)
};

// Function to apply styles using ANSI escape sequences
function applyStyles(specs, text) {
  let openingCodes = '', closingCodes = '';
  for (let spec of specs) {
    openingCodes += spec.open;
    closingCodes += spec.close;
    if (text.includes(spec.close)) {
      text = text.replace(spec.regex, spec.close + spec.open);
    }
  }
  return openingCodes + text + closingCodes;
}

// Create a chainable styling method context
function createChain(has, specs) {
  const context = { has, specs };
  for (let key in styles) {
    if (key !== 'enabled') context[key] = styles[key].bind(context);
  }
  return context;
}

// Generates styling methods with ANSI codes
function createStyleMethod(open, close) {
  const block = {
    open: `\x1b[${open}m`,
    close: `\x1b[${close}m`,
    regex: new RegExp(`\\x1b\\[${close}m`, 'g')
  };
  return function (text) {
    if (this !== undefined && this.has !== undefined) {
      if (!this.has.includes(open)) {
        this.has.push(open);
        this.specs.push(block);
      }
      return text === undefined ? this : styles.enabled ? applyStyles(this.specs, String(text)) : String(text);
    }
    return text === undefined ? createChain([open], [block]) : styles.enabled ? applyStyles([block], String(text)) : String(text);
  };
}

// Export the styles object
module.exports = styles;
