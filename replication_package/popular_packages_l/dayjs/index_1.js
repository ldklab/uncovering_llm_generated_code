/**
 * Simplified version of the Day.js library
 */

// Constructor for Day.js
class DayJS {
  constructor(date) {
    this.date = date ? new Date(date) : new Date();
  }

  startOf(unit) {
    const date = new Date(this.date);
    if (unit === 'month') {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    return new DayJS(date);
  }

  add(value, unit) {
    const date = new Date(this.date);
    if (unit === 'day') {
      date.setDate(date.getDate() + value);
    } else if (unit === 'year') {
      date.setFullYear(date.getFullYear() + value);
    }
    return new DayJS(date);
  }

  set(unit, value) {
    const date = new Date(this.date);
    if (unit === 'year') {
      date.setFullYear(value);
    } else if (unit === 'month') {
      date.setMonth(value - 1);  // Month is 0-indexed
    }
    return new DayJS(date);
  }

  format(formatStr) {
    const yyyy = this.date.getFullYear();
    const mm = (`0${this.date.getMonth() + 1}`).slice(-2);
    const dd = (`0${this.date.getDate()}`).slice(-2);
    const hh = (`0${this.date.getHours()}`).slice(-2);
    const min = (`0${this.date.getMinutes()}`).slice(-2);
    const ss = (`0${this.date.getSeconds()}`).slice(-2);
    // Simplified formatting, only handles 'YYYY-MM-DD HH:mm:ss'
    return formatStr.replace('YYYY', yyyy)
                    .replace('MM', mm)
                    .replace('DD', dd)
                    .replace('HH', hh)
                    .replace('mm', min)
                    .replace('ss', ss);
  }

  isBefore(otherDate) {
    return this.date < new DayJS(otherDate).date;
  }
}

// Usage examples
const dayjs = (date) => new DayJS(date);

console.log(dayjs().startOf('month').add(1, 'day').set('year', 2018).format('YYYY-MM-DD HH:mm:ss'));
console.log(dayjs('2018-08-08').format('YYYY-MM-DD'));
console.log(dayjs().add(1, 'year').format('YYYY-MM-DD'));

// Exports for Node.js
module.exports = { dayjs };
```
