class SimpleDate {
  constructor(inputDate) {
    this.date = new Date(inputDate);
    if (isNaN(this.date)) {
      throw new Error('Invalid date');
    }
  }

  static current() {
    return new SimpleDate(new Date());
  }

  formatDate() {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return new Intl.DateTimeFormat('default', options).format(this.date);
  }

  increment(value, unit) {
    const timeUnits = {
      seconds: 1000,
      minutes: 60000,
      hours: 3600000,
      days: 86400000
    };

    if (!timeUnits[unit]) {
      throw new Error('Invalid unit');
    }

    this.date = new Date(this.date.getTime() + value * timeUnits[unit]);
    return this;
  }

  decrement(value, unit) {
    return this.increment(-value, unit);
  }

  isDateValid() {
    return !isNaN(this.date.getTime());
  }

  convertToISOString() {
    return this.date.toISOString();
  }
}

// Example usage
const exampleDate = new SimpleDate('2023-10-12');
console.log(exampleDate.formatDate()); // Outputs the formatted date
exampleDate.increment(2, 'days');
console.log(exampleDate.convertToISOString()); // Date increased by 2 days

module.exports = SimpleDate;
