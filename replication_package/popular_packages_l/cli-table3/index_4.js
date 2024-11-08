// table.js

class Table {
  constructor(options = {}) {
    this.options = options;
    this.rows = [];
  }

  // Adds rows to the table
  push(...rows) {
    this.rows.push(...rows);
  }
   
  // Returns a string representation of the table
  toString() {
    const { head = [], colWidths = [], chars = {}, style = {} } = this.options;
    const paddingLeft = style['padding-left'] || 1;
    const paddingRight = style['padding-right'] || 1;

    const defaultChars = {
      top: '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
      bottom: '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
      left: '|', 'left-mid': '|', mid: '-', 'mid-mid': '+',
      right: '|', 'right-mid': '|', middle: '|'
    };

    const c = { ...defaultChars, ...chars };
    const lines = [];

    // Helper function to create table lines
    const drawLine = (type) => {
      return (head.length 
        ? c[type + '-left'] + head.map((_, i) => c[type].repeat(colWidths[i])).join(c[type + '-mid']) + c[type + '-right'] 
        : '');
    };
   
    // Add top line if we have a header
    if (head.length) lines.push(drawLine('top'));

    // Add the table headers
    if (head.length) {
      const header = head.map((h, i) => 
        h.padEnd(colWidths[i] - paddingRight).padStart(colWidths[i] - paddingLeft)
      ).join(c.middle);
      lines.push(c.left + header + c.right);
    }

    // Add mid line after headers
    if (head.length) lines.push(drawLine('mid'));

    // Add table rows
    for (const row of this.rows) {
      const rowData = Array.isArray(row) 
        ? row.map((cell, i) => 
            cell.toString().padEnd(colWidths[i] - paddingRight).padStart(colWidths[i] - paddingLeft)
          ).join(c.middle)
        : Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(' ');

      lines.push(c.left + rowData + c.right);
    }

    // Add bottom line if we have a header
    if (head.length) lines.push(drawLine('bottom'));

    return lines.join('\n');
  }
}

module.exports = Table;

// Example usage
// const Table = require('./table');
// const table = new Table({ head: ['Name', 'Age'], colWidths: [20, 10] });
// table.push(['Alice', 30], ['Bob', 25]);
// console.log(table.toString());
