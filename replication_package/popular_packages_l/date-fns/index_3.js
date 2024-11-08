// Import necessary functions from date-fns
import { compareAsc, format } from "date-fns";

// Function to format a date in 'YYYY-MM-DD' format
function formatDate(date) {
  return format(date, "yyyy-MM-dd"); // Formats the date to 'yyyy-MM-dd'
}

// Example usage of formatDate function
console.log(formatDate(new Date(2014, 1, 11))); // Logs '2014-02-11'

// Function to sort an array of Date objects in ascending order
function sortDates(dates) {
  return dates.sort(compareAsc); // Sorts dates using compareAsc from date-fns
}

// Example usage of sortDates function
const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];
console.log(sortDates(dates)); 
// Logs dates sorted in ascending order
// [
//   Wed Feb 11 1987 00:00:00,
//   Mon Jul 10 1989 00:00:00,
//   Sun Jul 02 1995 00:00:00
// ]

// Export the functions for external usage
export { formatDate, sortDates };

// Instructions for setting up date-fns as a dependency
// To use this module, ensure date-fns is installed via npm:
// npm install date-fns

// This code defines utility functions using date-fns library for date manipulation tasks.
```