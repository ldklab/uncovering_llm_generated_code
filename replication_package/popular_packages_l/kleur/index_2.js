// kleur/index.js
const isColorTerminal = process.stdout.isTTY && process.env.FORCE_COLOR !== '0';
const supportsColor = typeof process !== 'undefined' && isColorTerminal;

// ANSI escape codes
const codes = {
  modifiers: {
    reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23],
    underline: [4, 24], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29]
  },
  colors: {
    black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39],
    blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], gray: [90, 39]
  },
  backgrounds: {
    bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49],
    bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49]
  }
};

function applyAnsi(start, end) {
  return text => supportsColor ? `\x1b[${start}m${text}\x1b[${end}m` : text;
}

const kleur = { enabled: supportsColor };

for (let type in codes) {
  for (let style in codes[type]) {
    const [start, end] = codes[type][style];
    kleur[style] = function(text) {
      return arguments.length === 0 ? chainMethods(style, start, end) : (kleur.enabled ? `\x1b[${start}m${text}\x1b[${end}m` : text);
    };
  }
}

function chainMethods(style, start, end) {
  const chain = function(text) {
    return kleur.enabled ? `\x1b[${start}m${text}\x1b[${end}m` : text;
  };
  chain.style = style;
  chain.chainType = 'kleur';
  chain.apply = chainMethods;
  return chain;
}

module.exports = kleur;
kleur.colors = Object.fromEntries(Object.entries(codes.colors).map(([k, v]) => [k, applyAnsi(...v)]));
kleur.backgrounds = Object.fromEntries(Object.entries(codes.backgrounds).map(([k, v]) => [k, applyAnsi(...v)]));
kleur.modifiers = Object.fromEntries(Object.entries(codes.modifiers).map(([k, v]) => [k, applyAnsi(...v)]));
