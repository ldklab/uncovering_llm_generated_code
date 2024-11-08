/**
 * Simplified version of a date library similar to Day.js
 */

// Constructor for the date class
class SimpleDate {
  constructor(date) {
    this.date = date ? new Date(date) : new Date();
  }

  startOf(unit) {
    const newDate = new Date(this.date);
    if (unit === 'month') {
      newDate.setDate(1);
      newDate.setHours(0, 0, 0, 0);
    }
    return new SimpleDate(newDate);
  }

  add(amount, unit) {
    const newDate = new Date(this.date);
    if (unit === 'day') {
      newDate.setDate(newDate.getDate() + amount);
    } else if (unit === 'year') {
      newDate.setFullYear(newDate.getFullYear() + amount);
    }
    return new SimpleDate(newDate);
  }

  set(unit, value) {
    const newDate = new Date(this.date);
    if (unit === 'year') {
      newDate.setFullYear(value);
    } else if (unit === 'month') {
      newDate.setMonth(value);
    }
    return new SimpleDate(newDate);
  }

  format(formatString) {
    const year = this.date.getFullYear();
    const month = (`0${this.date.getMonth() + 1}`).slice(-2);
    const day = (`0${this.date.getDate()}`).slice(-2);
    const hours = (`0${this.date.getHours()}`).slice(-2);
    const minutes = (`0${this.date.getMinutes()}`).slice(-2);
    const seconds = (`0${this.date.getSeconds()}`).slice(-2);

    return formatString.replace('YYYY', year)
                       .replace('MM', month)
                       .replace('DD', day)
                       .replace('HH', hours)
                       .replace('mm', minutes)
                       .replace('ss', seconds);
  }

  isBefore(otherDate) {
    return this.date < new SimpleDate(otherDate).date;
  }
}

// Utility function to create new SimpleDate instances
const createDate = (date) => new SimpleDate(date);

// Logging examples of usage
console.log(createDate().startOf('month').add(1, 'day').set('year', 2018).format('YYYY-MM-DD HH:mm:ss'));
console.log(createDate('2018-08-08').format('YYYY-MM-DD'));
console.log(createDate().add(1, 'year').format('YYYY-MM-DD'));

// Exports for Node.js
module.exports = { createDate };
```