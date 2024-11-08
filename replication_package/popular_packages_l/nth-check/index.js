// nth-check.js

function parse(formula) {
  const match = formula.match(/^((?:-?\d*)?n)?\s*(?:\+?\s*(\d+))?$/);
  if (!match) throw new Error("Invalid formula");

  let a = parseInt(match[1], 10) || 0;
  const b = parseInt(match[2], 10) || 0;

  if (a === 0 && b === 0) throw new Error("Invalid formula");

  return [a, b];
}

function compile([a, b]) {
  return function(index) {
    if (a === 0) return index === b - 1;
    return (index - (b - 1)) % a === 0 && (index - (b - 1)) / a >= 0;
  };
}

function nthCheck(formula) {
  return compile(parse(formula));
}

function generate([a, b]) {
  let current = b - 1;
  return function() {
    if (a === 0) return current++ === current ? null : current;
    const result = current;
    current += a;
    return (a > 0 && result >= 0) || (a < 0 && result > 0) ? result : null;
  };
}

function sequence(formula) {
  return generate(parse(formula));
}

export { nthCheck, parse, compile, generate, sequence };
