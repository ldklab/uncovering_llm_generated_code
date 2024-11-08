class Fraction {
  constructor(a, b = null) {
    if (a instanceof Fraction) {
      this.s = a.s;
      this.n = a.n;
      this.d = a.d;
    } else {
      this.parseInput(a, b);
    }
  }

  parseInput(a, b) {
    if (b !== null) {
      this.fromNumeratorDenominator(a, b);
    } else if (typeof a === 'number') {
      this.fromNumber(a);
    } else if (typeof a === 'string') {
      this.fromString(a);
    } else if (Array.isArray(a)) {
      this.fromNumeratorDenominator(a[0], a[1]);
    } else if (typeof a === 'object' && 'n' in a && 'd' in a) {
      this.fromNumeratorDenominator(a.n, a.d);
    } else {
      throw new Error('Invalid input');
    }
  }

  fromNumeratorDenominator(n, d) {
    if (d === 0) throw new Error('Division by zero');
    const gcdValue = this.gcd(n, d);
    this.s = Math.sign(n) * Math.sign(d);
    this.n = BigInt(Math.abs(n) / gcdValue);
    this.d = BigInt(Math.abs(d) / gcdValue);
  }

  fromNumber(value) {
    this.fromString(value.toString());
  }

  fromString(str) {
    const [integerPart, fractionalPart = ''] = str.split('.');
    let repeating = fractionalPart.match(/\((.*)\)/);
    let nonRepeating = repeating ? repeating.input.slice(0, repeating.index) : fractionalPart;
    repeating = repeating ? repeating[1] : '';

    let denominator = Math.pow(10, nonRepeating.length) - 1;
    let numerator = parseInt(nonRepeating + repeating) - parseInt(nonRepeating);

    const totalNumerator = BigInt(parseInt(integerPart) * denominator + numerator);
    denominator *= Math.pow(10, repeating.length);

    this.fromNumeratorDenominator(totalNumerator, BigInt(denominator));
  }

  gcd(a, b) {
    return b ? this.gcd(b, a % b) : Math.abs(a);
  }

  lcm(a, b) {
    return (Math.abs(a) / this.gcd(a, b)) * Math.abs(b);
  }

  toFraction(showMixed = false) {
    const sign = this.s < 0 ? '-' : '';
    const whole = showMixed ? Math.floor(this.n / this.d) : 0;
    const rest = this.n % this.d;

    if (whole !== 0 && rest !== 0) {
      return `${sign}${whole} ${rest}/${this.d}`;
    }
    
    const numerator = whole !== 0 ? rest : this.n;
    if (numerator === 0) {
      return `${sign}${whole}`;
    }

    return `${sign}${numerator}/${this.d}`;
  }

  toString() {
    if (this.n === 0n) return '0';
    const decimal = Number(this.n) / Number(this.d);
    return decimal.toFixed(15).replace(/\.?0+$/, '');
  }

  valueOf() {
    return Number(this.n * BigInt(this.s)) / Number(this.d);
  }

  clone() {
    return new Fraction(this);
  }

  add(other) {
    const o = new Fraction(other);
    const numerator = this.s * this.n * o.d + o.s * o.n * this.d;
    const denominator = this.d * o.d;
    return new Fraction(numerator, denominator);
  }

  sub(other) {
    const o = new Fraction(other);
    const numerator = this.s * this.n * o.d - o.s * o.n * this.d;
    const denominator = this.d * o.d;
    return new Fraction(numerator, denominator);
  }

  mul(other) {
    const o = new Fraction(other);
    const numerator = this.s * o.s * this.n * o.n;
    const denominator = this.d * o.d;
    return new Fraction(numerator, denominator);
  }

  div(other) {
    const o = new Fraction(other);
    return this.mul(new Fraction(o.d, o.n));
  }

  mod(other) {
    const o = new Fraction(other);
    const remainder = this.sub(this.div(o).floor().mul(o));
    return new Fraction(remainder);
  }

  floor() {
    const quotient = this.n / this.d;
    const remainder = this.n % this.d;
    if ((this.s < 0 && remainder !== 0n) || (this.s * this.n < 0n)) {
      return new Fraction(quotient - 1n, 1);
    } else {
      return new Fraction(quotient, 1);
    }
  }

  ceil() {
    const quotient = this.n / this.d;
    const remainder = this.n % this.d;
    if ((this.s > 0 && remainder !== 0n) || (this.s * this.n > 0n)) {
      return new Fraction(quotient + 1n, 1);
    } else {
      return new Fraction(quotient, 1);
    }
  }

  simplify(eps = 0.001) {
    const tolerance = BigInt(Math.ceil(eps * Number(this.d)));
    let n = this.n;
    let d = this.d;
    while (Math.abs(Number(n / gcdValue - d / gcdValue)) > tolerance) {
      const gcdValue = this.gcd(n, d);
      n /= gcdValue;
      d /= gcdValue;
    }
    return new Fraction(n, d);
  }
}

module.exports = Fraction;
