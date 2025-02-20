// Import necessary functions from date-fns
import { compareAsc, format } from "date-fns";

// Function to format a date into 'yyyy-MM-dd' format
function formatDate(date) {
  return format(date, "yyyy-MM-dd");
}

// Example: Format a specific date
console.log(formatDate(new Date(2014, 1, 11))); // Outputs: '2014-02-11'

// Function to sort dates in ascending order
function sortDates(dates) {
  return dates.sort(compareAsc);
}

// Example: Sort an array of dates
const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];
console.log(sortDates(dates));
// Outputs:
// [
//   Wed Feb 11 1987 00:00:00,
//   Mon Jul 10 1989 00:00:00,
//   Sun Jul 02 1995 00:00:00
// ]

// Export the functions for reuse in other modules
export { formatDate, sortDates };
```

### Installation
To utilize this code, ensure that the `date-fns` package is installed in your project:

```bash
npm install date-fns
```

This code module performs two main functions using `date-fns`: formatting a date to `yyyy-MM-dd` format and sorting an array of dates in ascending order. It is structured to be reusable and efficient for integration into other JavaScript modules or applications.