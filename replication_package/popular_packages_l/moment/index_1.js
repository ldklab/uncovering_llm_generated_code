// moment-lite.js

class MomentLite {
  constructor(date) {
    this.date = new Date(date);
    if (isNaN(this.date)) {
      throw new Error('Invalid date');
    }
  }

  static now() {
    return new MomentLite(new Date());
  }

  format() {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Intl.DateTimeFormat('default', options).format(this.date);
  }

  add(amount, unit) {
    const unitMillisecondsMap = {
      seconds: 1000,
      minutes: 1000 * 60,
      hours: 1000 * 60 * 60,
      days: 1000 * 60 * 60 * 24,
    };

    const ms = unitMillisecondsMap[unit];
    if (!ms) {
      throw new Error('Invalid unit');
    }

    this.date = new Date(this.date.getTime() + amount * ms);
    return this;
  }

  subtract(amount, unit) {
    return this.add(-amount, unit);
  }

  isValid() {
    return !isNaN(this.date);
  }

  toISOString() {
    return this.date.toISOString();
  }
}

// Usage example
const myDate = new MomentLite('2023-10-12');
console.log(myDate.format()); // Outputs the formatted date
myDate.add(2, 'days');
console.log(myDate.toISOString()); // Date increased by 2 days

module.exports = MomentLite;
