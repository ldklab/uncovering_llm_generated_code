// bignumber.js - A library for arbitrary-precision decimal and non-decimal arithmetic

class BigNumber {
  constructor(value, base) {
    // Initializes from a string or number
    // Converts value to a string and parse it according to the base if provided
    this.c = BigNumber.parseCoefficient(value, base);
    this.e = BigNumber.getExponent(value);
    this.s = Math.sign(value);
  }

  // Static method to parse coefficient
  static parseCoefficient(value, base = 10) {
    // Implement parsing logic for coefficients, considering the base
    // Convert value to string if number
    return String(value).split('.').map(num => parseInt(num, base));
  }

  // Static method to get exponent
  static getExponent(value) {
    // Calculate the exponent for the value
    // Assume BigNumber can handle scientific notation
    return Math.floor(Math.log10(Math.abs(value)));
  }

  // Arithmetic operation methods
  plus(y) {
    // Add y to this BigNumber
    // Result is a new BigNumber
    // Handle different bases if y is BigNumber, match the exponents
    return new BigNumber(this.valueOf() + this.parse(y));
  }

  minus(y) {
    // Subtract y from this BigNumber
    return new BigNumber(this.valueOf() - this.parse(y));
  }

  times(y) {
    // Multiply this BigNumber by y
    return new BigNumber(this.valueOf() * this.parse(y));
  }

  dividedBy(y) {
    // Divide this BigNumber by y
    return new BigNumber(this.valueOf() / this.parse(y));
  }

  // Additional methods following similar implementations
  squareRoot() {
    return new BigNumber(Math.sqrt(this.valueOf()));
  }

  toFixed(dp=0) {
    return this.valueOf().toFixed(dp);
  }

  toString(base = 10) {
    // Convert BigNumber to string in specified base
    return this.valueOf().toString(base);
  }

  toFraction(maxD = 1000) {
    // Convert BigNumber to a fraction with an optional maximum denominator
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    let num = this.valueOf(), den = 1;
    while ((num % 1) !== 0 && den < maxD) { num *= 10; den *= 10; }
    const factor = gcd(num, den);
    return [num / factor, den / factor];
  }

  // Utility methods
  isEqualTo(y) {
    return this.valueOf() === this.parse(y);
  }

  isNaN() {
    return isNaN(this.valueOf());
  }

  isFinite() {
    return isFinite(this.valueOf());
  }

  // Internal helper
  parse(value) {
    return (value instanceof BigNumber) ? value.valueOf() : BigNumber(value).valueOf();
  }

  // Coercion to primitive numeric type
  valueOf() {
    return parseFloat(this.c.join('')) * Math.pow(10, this.e);
  }
}

// Sample configuration methods
BigNumber.set = function(config) {
  // Extend for setting global configuration
}

BigNumber.clone = function(config) {
  return new BigNumber(); // Initialize new instance with config
}

module.exports = BigNumber;
