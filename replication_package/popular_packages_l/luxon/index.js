// luxon.js

class DateTime {
  constructor(date = new Date()) {
    this.date = date;
  }

  static now() {
    return new DateTime();
  }

  setZone(timeZone) {
    // Assuming the environment supports `Intl` with the timeZone option
    const tzDate = new Date(
      this.date.toLocaleString("en-US", { timeZone })
    );
    return new DateTime(tzDate);
  }

  minus(duration) {
    const newDate = new Date(this.date);
    if (duration.weeks) {
      newDate.setDate(newDate.getDate() - duration.weeks * 7);
    }
    return new DateTime(newDate);
  }

  endOf(unit) {
    const newDate = new Date(this.date);
    if (unit === "day") {
      newDate.setHours(23, 59, 59, 999);
    }
    // Further implementations can be added for 'month', 'year', etc.
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
