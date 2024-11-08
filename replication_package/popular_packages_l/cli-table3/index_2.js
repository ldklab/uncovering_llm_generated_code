// Simplified Table creation utility for CLI

class SimpleTable {
  constructor({ head = [], colWidths = [], chars = {}, style = {} } = {}) {
    this.head = head;
    this.colWidths = colWidths;
    this.chars = { ...SimpleTable.defaultChars, ...chars };
    this.rows = [];
    this.style = style;
  }

  static defaultChars = {
    top: '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
    bottom: '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
    left: '|', 'left-mid': '|', mid: '-', 'mid-mid': '+',
    right: '|', 'right-mid': '|', middle: '|'
  };

  push(...rows) {
    this.rows.push(...rows);
  }

  drawLine(type) {
    const pad = this.chars[type] || '';
    return this.chars[type + '-left'] + 
           this.head.map((_, i) => pad.repeat(this.colWidths[i])).join(this.chars[type + '-mid']) + 
           this.chars[type + '-right'];
  }

  formatRow(row) {
    return row.map((cell, i) => cell.toString().padEnd(this.colWidths[i] - (this.style['padding-right'] || 1))
                                      .padStart(this.colWidths[i] - (this.style['padding-left'] || 1)))
              .join(this.chars.middle);
  }

  toString() {
    const result = [];
    if (this.head.length) result.push(this.drawLine('top'));

    if (this.head.length) result.push(this.chars.left + this.formatRow(this.head) + this.chars.right);
    if (this.head.length) result.push(this.drawLine('mid'));

    for (const row of this.rows) {
      const formattedRow = Array.isArray(row) ? this.formatRow(row)
                                              : Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(' ');
      result.push(this.chars.left + formattedRow + this.chars.right);
    }

    if (this.head.length) result.push(this.drawLine('bottom'));

    return result.join('\n');
  }
}

module.exports = SimpleTable;

// Example usage
// const SimpleTable = require('./simple-table');
// const table = new SimpleTable({ head: ['Name', 'Age'], colWidths: [20, 10] });
// table.push(['Alice', 30], ['Bob', 25]);
// console.log(table.toString());
