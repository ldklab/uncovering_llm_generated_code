// decimal.js implementation
class Decimal {
  constructor(value) {
    if (value instanceof Decimal) {
      this.value = value.value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      this.value = parseFloat(value);
    } else {
      throw new Error('Invalid input type');
    }
  }

  add(num) {
    return new Decimal(this.value + new Decimal(num).value);
  }

  subtract(num) {
    return new Decimal(this.value - new Decimal(num).value);
  }

  multiply(num) {
    return new Decimal(this.value * new Decimal(num).value);
  }

  divide(num) {
    if (num == 0 || new Decimal(num).value == 0) throw new Error('Cannot divide by zero');
    return new Decimal(this.value / new Decimal(num).value);
  }

  equals(num) {
    return this.value === new Decimal(num).value;
  }

  toString() {
    return this.value.toString();
  }

  toExponential(fractionDigits) {
    return this.value.toExponential(fractionDigits);
  }

  toFixed(digits) {
    return this.value.toFixed(digits);
  }

  toPrecision(digits) {
    return this.value.toPrecision(digits);
  }

  static sqrt(value) {
    return new Decimal(Math.sqrt(new Decimal(value).value));
  }

  static pow(base, exponent) {
    return new Decimal(Math.pow(new Decimal(base).value, new Decimal(exponent).value));
  }
}

module.exports = Decimal;

// Example usage
const Decimal = require('./decimal');

const a = new Decimal(123.4567);
const b = new Decimal('123456.7e-3');
const c = new Decimal(a);
console.log(a.equals(b) && b.equals(c) && a.equals(c)); // true

console.log(new Decimal(1e-324).toString()); // '0'
console.log(new Decimal(0.7 + 0.1).toFixed(10)); // '0.7999999999'
console.log(new Decimal('0xff.f').add('0b10101100').toString()); // '427.9375'

const piApprox = new Decimal(355).divide(113);
console.log(piApprox.toPrecision(10)); // '3.141592920'

const x = new Decimal(5);
const configureDecimal = (config) => {
  Decimal.prototype.precision = config ? config.precision : 10;
  return Decimal;
};

const configuredDecimal = new configureDecimal({ precision: 9 })(5);
console.log(configuredDecimal.divide(3).toFixed(9)); // '1.666666667'
