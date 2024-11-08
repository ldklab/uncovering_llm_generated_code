// luxon.js

class DateTime {
  constructor(date = new Date()) {
    this.date = date;
  }

  static now() {
    return new DateTime();
  }

  setZone(timeZone) {
    const formattedDate = this.date.toLocaleString("en-US", { timeZone });
    const tzDate = new Date(formattedDate);
    return new DateTime(tzDate);
  }

  minus({ weeks = 0 }) {
    const newDate = new Date(this.date);
    newDate.setDate(newDate.getDate() - weeks * 7);
    return new DateTime(newDate);
  }

  endOf(unit) {
    const newDate = new Date(this.date);
    if (unit === "day") {
      newDate.setHours(23, 59, 59, 999);
    }
    return new DateTime(newDate);
  }

  toISO() {
    return this.date.toISOString();
  }
}

// Example usage
const result = DateTime.now()
  .setZone("America/New_York")
  .minus({ weeks: 1 })
  .endOf("day")
  .toISO();

console.log(result); // Output: ISO 8601 formatted string
