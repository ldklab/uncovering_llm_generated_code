// dateTime.js

class DateTime {
  constructor(date = new Date()) {
    this.date = date;
  }

  // Static method to get the current DateTime object
  static now() {
    return new DateTime();
  }

  // Adjusts the DateTime object to a specified timezone
  setZone(timeZone) {
    const tzDate = new Date(
      this.date.toLocaleString("en-US", { timeZone })
    );
    return new DateTime(tzDate);
  }

  // Subtracts a specified duration from the DateTime
  minus(duration) {
    const newDate = new Date(this.date);
    if (duration.weeks) {
      newDate.setDate(newDate.getDate() - duration.weeks * 7);
    }
    return new DateTime(newDate);
  }

  // Adjusts the DateTime to the end of the specified unit of time
  endOf(unit) {
    const newDate = new Date(this.date);
    if (unit === "day") {
      newDate.setHours(23, 59, 59, 999);
    }
    return new DateTime(newDate);
  }

  // Converts the DateTime to an ISO 8601 formatted string
  toISO() {
    return this.date.toISOString();
  }
}

// Example of using the DateTime class to get and manipulate the current date and time
const result = DateTime.now()
  .setZone("America/New_York")
  .minus({ weeks: 1 })
  .endOf("day")
  .toISO();

console.log(result); // Logs the ISO 8601 formatted date-time string
