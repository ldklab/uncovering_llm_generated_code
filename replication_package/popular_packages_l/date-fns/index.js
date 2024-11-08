// Import necessary functions from date-fns
import { compareAsc, format } from "date-fns";

// Function to format a date
function formatDate(date) {
  return format(date, "yyyy-MM-dd");
}

// Example usage of formatDate
console.log(formatDate(new Date(2014, 1, 11))); // Output: '2014-02-11'

// Function to sort an array of dates in ascending order
function sortDates(dates) {
  return dates.sort(compareAsc);
}

// Example usage of sortDates
const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];
console.log(sortDates(dates)); 
// Output:
// [
//   Wed Feb 11 1987 00:00:00,
//   Mon Jul 10 1989 00:00:00,
//   Sun Jul 02 1995 00:00:00
// ]

// Export functions for use in other modules
export { formatDate, sortDates };
```

### Installation
To use this package, ensure you have `date-fns` installed. You can install it using npm:

```bash
npm install date-fns
```

This module provides basic functionalities using `date-fns` functionalities like formatting a date and sorting dates—all while demonstrating how to keep the utility modular and efficient.