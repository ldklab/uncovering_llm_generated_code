class BigNumber {
  constructor(value, base = 10) {
    this.value = BigInt(convertToDecimal(value, base));
  }

  // Arithmetic Operations
  add(other) {
    const operand = other instanceof BigNumber ? other.value : BigInt(other);
    return new BigNumber((this.value + operand).toString());
  }

  subtract(other) {
    const operand = other instanceof BigNumber ? other.value : BigInt(other);
    return new BigNumber((this.value - operand).toString());
  }

  multiply(other) {
    const operand = other instanceof BigNumber ? other.value : BigInt(other);
    return new BigNumber((this.value * operand).toString());
  }

  // Utility Method
  convertToString(base = 10) {
    return this.value.toString(base);
  }

  // Comparison Methods
  isEqualTo(other) {
    return this.value === other.value;
  }

  isLessThan(other) {
    return this.value < other.value;
  }

  isGreaterThan(other) {
    return this.value > other.value;
  }

  // Bitwise Operation
  bitwiseAnd(other) {
    return new BigNumber((this.value & other.value).toString());
  }

  // Clone Method
  clone() {
    return new BigNumber(this.value.toString());
  }
}

// Helper Function for Base Conversion
function convertToDecimal(input, base) {
  switch (base) {
    case 2:
      return parseInt(input, 2).toString();
    case 16:
      return parseInt(input, 16).toString();
    default:
      return input.toString();
  }
}

// Example Usage
const numberA = new BigNumber('dead', 16);
const numberB = new BigNumber('101010', 2);
const result = numberA.add(numberB);
console.log(result.convertToString(10));  // Output: 57047
