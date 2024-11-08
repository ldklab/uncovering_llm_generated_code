// nth-check.js

/**
 * Parses an nth-check formula string into its numeric components.
 * @param {string} formula - The nth-check formula to parse.
 * @returns {[number, number]} A tuple representing coefficients [a, b] from the formula an + b.
 */
function parse(formula) {
  const match = formula.match(/^((?:-?\d*)?n)?\s*(?:\+?\s*(\d+))?$/);
  if (!match) throw new Error("Invalid formula");

  const a = parseInt(match[1], 10) || 0;
  const b = parseInt(match[2], 10) || 0;

  if (a === 0 && b === 0) throw new Error("Invalid formula");

  return [a, b];
}

/**
 * Compiles numeric components into a function that checks index validity.
 * @param {[number, number]} components - The numeric components [a, b].
 * @returns {Function} A function that checks if a given index meets the nth conditions.
 */
function compile([a, b]) {
  return function(index) {
    if (a === 0) return index === b - 1;
    return (index - (b - 1)) % a === 0 && (index - (b - 1)) / a >= 0;
  };
}

/**
 * Creates a checking function for nth positions based on a formula.
 * @param {string} formula - The nth-check formula.
 * @returns {Function} A function to check if an index satisfies the nth position.
 */
function nthCheck(formula) {
  return compile(parse(formula));
}

/**
 * Generates indices based on the nth formula's numeric components.
 * @param {[number, number]} components - The numeric components [a, b].
 * @returns {Function} A generator function that provides successive index values.
 */
function generate([a, b]) {
  let current = b - 1;
  return function() {
    if (a === 0) return current++ === current ? null : current;
    const result = current;
    current += a;
    return (a > 0 && result >= 0) || (a < 0 && result > 0) ? result : null;
  };
}

/**
 * Provides a sequence generator based on the nth-check formula.
 * @param {string} formula - The nth-check formula.
 * @returns {Function} A generator function for producing indices.
 */
function sequence(formula) {
  return generate(parse(formula));
}

export { nthCheck, parse, compile, generate, sequence };
