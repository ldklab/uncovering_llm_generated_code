const isColorTerminal = process.stdout.isTTY && process.env.FORCE_COLOR !== '0';
const supportsColor = typeof process !== 'undefined' && isColorTerminal;

const codes = {
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

function applyStyle(start, end) {
  return function (str) {
    return supportsColor ? `\x1b[${start}m${str}\x1b[${end}m` : str;
  };
}

const kleur = {
  enabled: supportsColor
};

Object.keys(codes).forEach(type => {
  Object.keys(codes[type]).forEach(style => {
    const [start, end] = codes[type][style];
    kleur[style] = function (str) {
      if (arguments.length === 0) {
        return createChainer(style, start, end);
      }
      return kleur.enabled ? `\x1b[${start}m${str}\x1b[${end}m` : str;
    };
  });
});

function createChainer(style, start, end) {
  const chain = function (str) {
    return kleur.enabled ? `\x1b[${start}m${str}\x1b[${end}m` : str;
  };
  chain.style = style;
  chain.asInstanceOf = 'kleur';
  return chain;
}

module.exports = kleur;

kleur.colors = Object.keys(codes.colors).reduce((acc, color) => {
  acc[color] = applyStyle(...codes.colors[color]);
  return acc;
}, {});
kleur.backgrounds = Object.keys(codes.backgrounds).reduce((acc, bg) => {
  acc[bg] = applyStyle(...codes.backgrounds[bg]);
  return acc;
}, {});
kleur.modifiers = Object.keys(codes.modifiers).reduce((acc, mod) => {
  acc[mod] = applyStyle(...codes.modifiers[mod]);
  return acc;
}, {});
