// datetime.js

class DateTime {
  constructor(date = new Date()) {
    this.date = date;
  }

  static now() {
    // Returns an instance of DateTime with the current date and time
    return new DateTime();
  }

  setZone(timeZone) {
    // Adjusts the date to the specified time zone using Intl API
    const tzDate = new Date(
      this.date.toLocaleString("en-US", { timeZone })
    );
    // Returns a new DateTime instance with the adjusted time zone
    return new DateTime(tzDate);
  }

  minus(duration) {
    // Subtracts the specified duration from the date
    const newDate = new Date(this.date);
    if (duration.weeks) {
      newDate.setDate(newDate.getDate() - duration.weeks * 7);
    }
    // Returns a new DateTime instance with the adjusted date
    return new DateTime(newDate);
  }

  endOf(unit) {
    // Sets the time to the end of the specified unit
    const newDate = new Date(this.date);
    if (unit === "day") {
      newDate.setHours(23, 59, 59, 999);
    }
    // Returns a new DateTime instance with the adjusted time
    return new DateTime(newDate);
  }

  toISO() {
    // Returns an ISO 8601 formatted string of the date
    return this.date.toISOString();
  }
}

// Example usage
const result = DateTime.now()
  .setZone("America/New_York")
  .minus({ weeks: 1 })
  .endOf("day")
  .toISO();

console.log(result); // Outputs the date as an ISO 8601 formatted string
