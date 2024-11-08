class LinearScale {
  constructor(domain = [0, 1], range = [0, 1]) {
    this.domain = domain;
    this.range = range;
    this.clampFlag = false;
  }

  // Setting or getting domain
  setDomain(domain) {
    this.domain = domain;
    return this;
  }

  getDomain() {
    return this.domain;
  }

  // Setting or getting range
  setRange(range) {
    this.range = range;
    return this;
  }

  getRange() {
    return this.range;
  }

  // Clamping setting
  clamp(flag = true) {
    this.clampFlag = flag;
    return this;
  }

  // Scale function
  scale(value) {
    const [d0, d1] = this.domain;
    const [r0, r1] = this.range;
    const t = (value - d0) / (d1 - d0);
    let result = r0 + t * (r1 - r0);

    if (this.clampFlag) {
      result = Math.max(r0, Math.min(r1, result));
    }
    
    return result;
  }

  // Invert function
  invert(value) {
    const [d0, d1] = this.domain;
    const [r0, r1] = this.range;
    const t = (value - r0) / (r1 - r0);
    return d0 + t * (d1 - d0);
  }

  // Generate tick values
  ticks(count = 10) {
    const [d0, d1] = this.domain;
    const step = (d1 - d0) / count;
    return Array.from({ length: count + 1 }, (_, i) => d0 + i * step);
  }

  // Format tick values
  tickFormat(count = 10, formatter = (d) => d.toFixed(2)) {
    return (d) => formatter(d);
  }
}

// Example usage:
const xScale = new LinearScale([10, 130], [0, 960]);
console.log(xScale.scale(20)); // Output: 80
console.log(xScale.invert(80)); // Output: 20
console.log(xScale.ticks()); // Generate ticks
