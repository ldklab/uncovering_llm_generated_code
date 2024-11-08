// cli-table3.js

class Table {
  constructor(options = {}) {
    this.options = options;
    this.rows = [];
  }

  push(...rows) {
    this.rows.push(...rows);
  }

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

    const drawLine = (place) => head.length ? c[place + '-left'] + head.map((_, i) => c[place].repeat(colWidths[i])).join(c[place + '-mid']) + c[place + '-right'] : '';

    if (head.length) lines.push(drawLine('top'));

    if (head.length) {
      const header = head.map((h, i) => h.padEnd(colWidths[i] - paddingRight).padStart(colWidths[i] - paddingLeft)).join(c.middle);
      lines.push(c.left + header + c.right);
    }

    if (head.length) lines.push(drawLine('mid'));

    for (const row of this.rows) {
      const rowData = Array.isArray(row) 
        ? row.map((cell, i) => cell.toString().padEnd(colWidths[i] - paddingRight).padStart(colWidths[i] - paddingLeft)).join(c.middle)
        : Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(' ');

      lines.push(c.left + rowData + c.right);
    }

    if (head.length) lines.push(drawLine('bottom'));

    return lines.join('\n');
  }
}

module.exports = Table;

// Example usage
// const Table = require('./cli-table3');
// let t = new Table({ head: ['Name', 'Age'], colWidths: [20, 10], chars: {} });
// t.push(['Alice', 30], ['Bob', 25]);
// console.log(t.toString());
