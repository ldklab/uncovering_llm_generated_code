// nth-check.js

// Parses the nth-child formula into a coefficients array [a, b].
function parse(formula) {
  const match = formula.match(/^((?:-?\d*)?n)?\s*(?:\+?\s*(\d+))?$/);
  if (!match) throw new Error("Invalid formula");

  let a = parseInt(match[1], 10) || 0;
  const b = parseInt(match[2], 10) || 0;

  if (a === 0 && b === 0) throw new Error("Invalid formula");

  return [a, b];
}

// Compiles the coefficients into a function that checks a specific index.
function compile([a, b]) {
  return function(index) {
    if (a === 0) return index === b - 1;
    return (index - (b - 1)) % a === 0 && (index - (b - 1)) / a >= 0;
  };
}

// Main function to obtain the index-checking function from a formula.
function nthCheck(formula) {
  return compile(parse(formula));
}

// Generates a sequence of indices that match the formula.
function generate([a, b]) {
  let current = b - 1;
  return function() {
    if (a === 0) return current++ === current ? null : current;
    const result = current;
    current += a;
    return (a > 0 && result >= 0) || (a < 0 && result > 0) ? result : null;
  };
}

// Returns a generator function for a sequence of matching indices.
function sequence(formula) {
  return generate(parse(formula));
}

export { nthCheck, parse, compile, generate, sequence };
