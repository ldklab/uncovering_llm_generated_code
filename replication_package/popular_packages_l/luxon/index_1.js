// luxon.js

class DateTime {
  constructor(date = new Date()) {
    this.date = date;
  }

  static now() {
    return new DateTime();
  }

  setZone(timeZone) {
    // Adjust the date to the specified time zone using Intl API
    const adjustedDate = new Date(
      this.date.toLocaleString("en-US", { timeZone })
    );
    return new DateTime(adjustedDate);
  }

  minus(duration) {
    const adjustedDate = new Date(this.date);
    if (duration.weeks) {
      adjustedDate.setDate(adjustedDate.getDate() - (duration.weeks * 7));
    }
    return new DateTime(adjustedDate);
  }

  endOf(unit) {
    const adjustedDate = new Date(this.date);
    if (unit === "day") {
      // Set date to the end of the day with max time values
      adjustedDate.setHours(23, 59, 59, 999);
    }
    // Additional units like 'month', 'year' can be handled here
    return new DateTime(adjustedDate);
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
