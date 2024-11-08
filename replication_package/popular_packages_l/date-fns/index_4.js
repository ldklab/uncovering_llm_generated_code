// Import necessary functions from date-fns
import { compareAsc, format } from "date-fns";

// Function to format a date to 'yyyy-MM-dd' format
function formatDate(date) {
  return format(date, "yyyy-MM-dd");
}

// Example usage of formatDate function
console.log(formatDate(new Date(2014, 1, 11))); // Expected output: '2014-02-11'

// Function to sort an array of Date objects in ascending order
function sortDates(dates) {
  return dates.sort(compareAsc);
}

// Example usage of sortDates function
const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];
console.log(sortDates(dates));
// Expected output:
// [
//   Wed Feb 11 1987 00:00:00 GMT+0000 (Coordinated Universal Time),
//   Mon Jul 10 1989 00:00:00 GMT+0000 (Coordinated Universal Time),
//   Sun Jul 02 1995 00:00:00 GMT+0000 (Coordinated Universal Time)
// ]

// Export the functions to be used in other modules
export { formatDate, sortDates };
```
