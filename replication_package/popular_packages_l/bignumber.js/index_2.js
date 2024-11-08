class BigNumber {
  constructor(value, base = 10) {
    this.s = Math.sign(value); // Sign of the number
    this.c = BigNumber.parseCoefficient(value, base); // Coefficient
    this.e = BigNumber.getExponent(value); // Exponent
  }

  static parseCoefficient(value, base = 10) {
    // Parse and return coefficients based on the base of the number
    return String(value).split('.').map(num => parseInt(num, base));
  }

  static getExponent(value) {
    // Calculate and return the exponent of the number
    return Math.floor(Math.log10(Math.abs(value)));
  }

  plus(y) {
    // Add a BigNumber or number to this instance
    return new BigNumber(this.valueOf() + this.parse(y));
  }

  minus(y) {
    // Subtract a BigNumber or number from this instance
    return new BigNumber(this.valueOf() - this.parse(y));
  }

  times(y) {
    // Multiply this instance by a BigNumber or number
    return new BigNumber(this.valueOf() * this.parse(y));
  }

  dividedBy(y) {
    // Divide this instance by a BigNumber or number
    return new BigNumber(this.valueOf() / this.parse(y));
  }

  squareRoot() {
    // Return the square root of this BigNumber
    return new BigNumber(Math.sqrt(this.valueOf()));
  }

  toFixed(dp = 0) {
    // Return this BigNumber formatted with a fixed number of decimal places
    return this.valueOf().toFixed(dp);
  }

  toString(base = 10) {
    // Convert this BigNumber to a string representation in the specified base
    return this.valueOf().toString(base);
  }

  toFraction(maxD = 1000) {
    // Convert this BigNumber to a fraction with a given max denominator
    const gcd = (a, b) => (b ? gcd(b, a % b) : a); // Greatest common divisor
    let num = this.valueOf(), den = 1;
    while ((num % 1) !== 0 && den < maxD) { num *= 10; den *= 10; }
    const factor = gcd(num, den);
    return [num / factor, den / factor];
  }

  isEqualTo(y) {
    // Check if this BigNumber is equal to another BigNumber or number
    return this.valueOf() === this.parse(y);
  }

  isNaN() {
    // Check if this BigNumber is NaN
    return isNaN(this.valueOf());
  }

  isFinite() {
    // Check if this BigNumber is finite
    return isFinite(this.valueOf());
  }

  parse(value) {
    // Helper to parse a value: if BigNumber, call valueOf, else convert directly
    return (value instanceof BigNumber) ? value.valueOf() : BigNumber(value).valueOf();
  }

  valueOf() {
    // Coerce this BigNumber into a primitive number
    return parseFloat(this.c.join('')) * Math.pow(10, this.e);
  }
}

BigNumber.set = function(config) {
  // Method stub for global configuration settings
}

BigNumber.clone = function(config) {
  // Create a new BigNumber instance with given configuration
  return new BigNumber();
}

module.exports = BigNumber;
