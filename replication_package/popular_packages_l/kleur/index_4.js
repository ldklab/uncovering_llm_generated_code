const supportsColor = (() => {
  const forceColor = process.env.FORCE_COLOR;
  return process.stdout.isTTY && forceColor !== '0';
})();

const ansiCodes = {
  modifiers: {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  colors: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39]
  },
  backgrounds: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49]
  }
};

function createStyleFunction(start, end) {
  return function(str) {
    return supportsColor ? `\x1b[${start}m${str}\x1b[${end}m` : str;
  };
}

const kleur = { enabled: supportsColor };

function addStylesToKleur(styles) {
  Object.entries(styles).forEach(([styleName, styleSequence]) => {
    const [start, end] = styleSequence;
    kleur[styleName] = function(str) {
      return arguments.length ? createStyleFunction(start, end)(str) : createChainer(styleName, start, end);
    };
  });
}

function createChainer(style, start, end) {
  const chainFunction = (str) => supportsColor ? `\x1b[${start}m${str}\x1b[${end}m` : str;
  chainFunction.style = style;
  chainFunction.asInstanceOf = 'kleur';
  chainFunction.apply = createChainer;
  return chainFunction;
}

addStylesToKleur(ansiCodes.modifiers);
addStylesToKleur(ansiCodes.colors);
addStylesToKleur(ansiCodes.backgrounds);

module.exports = kleur;

// Optionally expose categorized styles
kleur.modifiers = Object.fromEntries(Object.entries(ansiCodes.modifiers).map(([mod, codes]) => [mod, createStyleFunction(...codes)]));
kleur.colors = Object.fromEntries(Object.entries(ansiCodes.colors).map(([color, codes]) => [color, createStyleFunction(...codes)]));
kleur.backgrounds = Object.fromEntries(Object.entries(ansiCodes.backgrounds).map(([bg, codes]) => [bg, createStyleFunction(...codes)]));
