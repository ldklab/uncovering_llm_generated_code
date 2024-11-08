/**
 * Simplified version of the Day.js library
 */

// Constructor for Day.js functionality
class SimpleDayJS {
  constructor(inputDate) {
    this.date = inputDate ? new Date(inputDate) : new Date();
  }

  startOf(unit) {
    const date = new Date(this.date);
    if (unit === 'month') {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    return new SimpleDayJS(date);
  }

  add(value, unit) {
    const date = new Date(this.date);
    if (unit === 'day') {
      date.setDate(date.getDate() + value);
    } else if (unit === 'year') {
      date.setFullYear(date.getFullYear() + value);
    }
    return new SimpleDayJS(date);
  }

  set(unit, value) {
    const date = new Date(this.date);
    if (unit === 'year') {
      date.setFullYear(value);
    } else if (unit === 'month') {
      date.setMonth(value);
    }
    return new SimpleDayJS(date);
  }

  format(pattern) {
    const formatComponents = {
      YYYY: this.date.getFullYear(),
      MM: (`0${this.date.getMonth() + 1}`).slice(-2),
      DD: (`0${this.date.getDate()}`).slice(-2),
      HH: (`0${this.date.getHours()}`).slice(-2),
      mm: (`0${this.date.getMinutes()}`).slice(-2),
      ss: (`0${this.date.getSeconds()}`).slice(-2),
    };
    return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => formatComponents[match]);
  }

  isBefore(targetDate) {
    return this.date < new SimpleDayJS(targetDate).date;
  }
}

// Factory function for creating instances of SimpleDayJS
const dayjs = (date) => new SimpleDayJS(date);

// Usage examples
console.log(dayjs().startOf('month').add(1, 'day').set('year', 2018).format('YYYY-MM-DD HH:mm:ss'));
console.log(dayjs('2018-08-08').format('YYYY-MM-DD'));
console.log(dayjs().add(1, 'year').format('YYYY-MM-DD'));

// Exports for Node.js
module.exports = { dayjs };
```