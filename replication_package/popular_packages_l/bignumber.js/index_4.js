// bignumber.js - A library for arbitrary-precision decimal and non-decimal arithmetic

class BigNumber {
  constructor(value, base = 10) {
    // Initialize the BigNumber instance by parsing the given value
    // Store the coefficient, exponent, and sign based on the input
    this.c = BigNumber.parseCoefficient(value, base);
    this.e = BigNumber.getExponent(value);
    this.s = Math.sign(value);
  }

  // Parse the coefficient of the number based on the given base
  static parseCoefficient(value, base = 10) {
    // Split value into integer and decimal parts, converting each to integers
    return String(value).split('.').map(num => parseInt(num, base));
  }

  // Determine the exponent from the scientific notation perspective
  static getExponent(value) {
    // Use logarithm to find the closest power of 10 for the magnitude
    return Math.floor(Math.log10(Math.abs(value)));
  }

  // Combine with another BigNumber or numeric value
  plus(y) {
    return new BigNumber(this.valueOf() + this.parse(y));
  }

  // Subtract another BigNumber or numeric value
  minus(y) {
    return new BigNumber(this.valueOf() - this.parse(y));
  }

  // Multiply by another BigNumber or numeric value
  times(y) {
    return new BigNumber(this.valueOf() * this.parse(y));
  }

  // Divide by another BigNumber or numeric value
  dividedBy(y) {
    return new BigNumber(this.valueOf() / this.parse(y));
  }

  // Calculate the square root
  squareRoot() {
    return new BigNumber(Math.sqrt(this.valueOf()));
  }

  // Convert to fixed-point notation
  toFixed(dp = 0) {
    return this.valueOf().toFixed(dp);
  }

  // Convert to a string in a specified numerical base
  toString(base = 10) {
    return this.valueOf().toString(base);
  }

  // Attempt to represent the value as an approximate fraction
  toFraction(maxD = 1000) {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    let num = this.valueOf(), den = 1;
    while ((num % 1) !== 0 && den < maxD) {
      num *= 10; den *= 10;
    }
    const factor = gcd(num, den);
    return [num / factor, den / factor];
  }

  // Comparison and utility methods
  isEqualTo(y) {
    return this.valueOf() === this.parse(y);
  }

  isNaN() {
    return isNaN(this.valueOf());
  }

  isFinite() {
    return isFinite(this.valueOf());
  }

  // Internal utility for parsing input as a BigNumber
  parse(value) {
    return value instanceof BigNumber ? value.valueOf() : new BigNumber(value).valueOf();
  }

  // Coerce internal representation to a primitive numeric value
  valueOf() {
    return parseFloat(this.c.join('')) * Math.pow(10, this.e);
  }
}

// Configuration methods
BigNumber.set = function(config) {
  // Placeholder for setting global configuration options
}

BigNumber.clone = function(config) {
  return new BigNumber(); // Create a new BigNumber instance, potentially with configuration
}

module.exports = BigNumber;
