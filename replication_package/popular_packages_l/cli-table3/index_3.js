// cli-table3-rewrite.js

class Table {
  constructor(options = {}) {
    // Initialize the table with passed options and an empty array for rows
    this.options = options;
    this.rows = [];
  }

  // Add rows to the table
  push(...rows) {
    this.rows.push(...rows);
  }

  // Convert the table data to a formatted string
  toString() {
    // Destructure options for table configuration
    const { head = [], colWidths = [], chars = {}, style = {} } = this.options;
    const paddingLeft = style['padding-left'] || 1;
    const paddingRight = style['padding-right'] || 1;
    
    // Set default characters for table borders and separators
    const defaultChars = {
      top: '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
      bottom: '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
      left: '|', 'left-mid': '|', mid: '-', 'mid-mid': '+',
      right: '|', 'right-mid': '|', middle: '|'
    };

    // Merge passed characters with defaults
    const c = { ...defaultChars, ...chars };
    const lines = [];

    // Helper function to draw lines (top, mid, bottom)
    const drawLine = (place) => head.length ? c[place + '-left'] + head.map((_, i) => c[place].repeat(colWidths[i])).join(c[place + '-mid']) + c[place + '-right'] : '';

    // Draw top line
    if (head.length) lines.push(drawLine('top'));

    // Render header row
    if (head.length) {
      const header = head.map((h, i) => h.padEnd(colWidths[i] - paddingRight).padStart(colWidths[i] - paddingLeft)).join(c.middle);
      lines.push(c.left + header + c.right);
    }

    // Draw line after header
    if (head.length) lines.push(drawLine('mid'));

    // Render each data row
    for (const row of this.rows) {
      const rowData = Array.isArray(row) 
        ? row.map((cell, i) => cell.toString().padEnd(colWidths[i] - paddingRight).padStart(colWidths[i] - paddingLeft)).join(c.middle)
        : Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(' ');

      lines.push(c.left + rowData + c.right);
    }

    // Draw bottom line
    if (head.length) lines.push(drawLine('bottom'));

    // Return the formatted table
    return lines.join('\n');
  }
}

module.exports = Table;

// Example usage
// const Table = require('./cli-table3-rewrite');
// let t = new Table({ head: ['Name', 'Age'], colWidths: [20, 10], chars: {} });
// t.push(['Alice', 30], ['Bob', 25]);
// console.log(t.toString());
