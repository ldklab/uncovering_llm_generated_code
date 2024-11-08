class Fraction {
  constructor(a, b = null) {
    if (a instanceof Fraction) {
      this.copyFromFraction(a);
    } else {
      this.parseInput(a, b);
    }
  }

  copyFromFraction(fraction) {
    this.s = fraction.s;
    this.n = fraction.n;
    this.d = fraction.d;
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
    } else if (typeof a === 'object' && a.n && a.d) {
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
    const repeatingMatch = fractionalPart.match(/\((.*)\)/);
    const nonRepeating = repeatingMatch ? repeatingMatch.input.slice(0, repeatingMatch.index) : fractionalPart;
    const repeating = repeatingMatch ? repeatingMatch[1] : '';

    let denominator = Math.pow(10, nonRepeating.length) - 1;
    let numerator = parseInt(nonRepeating + repeating) - parseInt(nonRepeating);

    const totalNumerator = BigInt(parseInt(integerPart) * denominator + numerator);
    denominator *= Math.pow(10, repeating.length);

    this.fromNumeratorDenominator(totalNumerator, BigInt(denominator));
  }

  gcd(a, b) {
    return b ? this.gcd(b, a % b) : Math.abs(a);
  }

  toFraction(showMixed = false) {
    const sign = this.s < 0 ? '-' : '';
    const whole = showMixed ? Math.floor(this.n / this.d) : 0;
    const rest = this.n % this.d;

    if (whole !== 0 && rest !== 0) {
      return `${sign}${whole} ${rest}/${this.d}`;
    }
    
    const numerator = whole !== 0 ? rest : this.n;
    return numerator === 0 ? `${sign}${whole}` : `${sign}${numerator}/${this.d}`;
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
    return this.operate(other, 'add');
  }

  sub(other) {
    return this.operate(other, 'sub');
  }

  mul(other) {
    return this.operate(other, 'mul');
  }

  div(other) {
    return this.operate(other, 'div');
  }

  operate(other, operation) {
    const o = new Fraction(other);
    let numerator, denominator;
    switch (operation) {
      case "add":
        numerator = this.s * this.n * o.d + o.s * o.n * this.d;
        break;
      case "sub":
        numerator = this.s * this.n * o.d - o.s * o.n * this.d;
        break;
      case "mul":
        numerator = this.s * o.s * this.n * o.n;
        break;
      case "div":
        return this.mul(new Fraction(o.d, o.n));
    }
    denominator = this.d * o.d;
    return new Fraction(numerator, denominator);
  }

  floor() {
    const quotient = this.n / this.d;
    const remainder = this.n % this.d;
    return new Fraction((this.s < 0 && remainder !== 0n) ? quotient - 1n : quotient, 1);
  }

  ceil() {
    const quotient = this.n / this.d;
    const remainder = this.n % this.d;
    return new Fraction((this.s > 0 && remainder !== 0n) ? quotient + 1n : quotient, 1);
  }

  simplify(eps = 0.001) {
    const tolerance = BigInt(Math.ceil(eps * Number(this.d)));
    let gcdValue;
    let n = this.n, d = this.d;
    while (Math.abs(Number(n / gcdValue - d / gcdValue)) > tolerance) {
      gcdValue = this.gcd(n, d);
      n /= gcdValue;
      d /= gcdValue;
    }
    return new Fraction(n, d);
  }
}

module.exports = Fraction;
