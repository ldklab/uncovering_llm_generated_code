class BN {
  constructor(number, base = 10) {
    this.number = BigInt(this._convertToDecimal(number, base));
  }

  // Convert binary/hexadecimal to decimal
  _convertToDecimal(input, base) {
    if (base === 2) return parseInt(input, 2).toString();
    if (base === 16) return parseInt(input, 16).toString();
    return input.toString();
  }

  // Arithmetic operations
  add(b) {
    const bNumber = b instanceof BN ? b.number : BigInt(b);
    return new BN((this.number + bNumber).toString());
  }

  sub(b) {
    const bNumber = b instanceof BN ? b.number : BigInt(b);
    return new BN((this.number - bNumber).toString());
  }

  mul(b) {
    const bNumber = b instanceof BN ? b.number : BigInt(b);
    return new BN((this.number * bNumber).toString());
  }

  // Convert to string with specified base
  toString(base = 10) {
    return this.number.toString(base);
  }

  // Comparison methods
  eq(b) {
    return this.number === b.number;
  }

  lt(b) {
    return this.number < b.number;
  }

  gt(b) {
    return this.number > b.number;
  }

  // Bitwise AND operation
  and(b) {
    const bNumber = b instanceof BN ? b.number : BigInt(b);
    return new BN((this.number & bNumber).toString());
  }

  // Clone current BN
  clone() {
    return new BN(this.number.toString());
  }
}

// Usage example
const a = new BN('dead', 16);
const b = new BN('101010', 2);
const res = a.add(b);
console.log(res.toString(10));  // Output: 57047
