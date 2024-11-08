// cli-table3-rewrite.js

class Table {
  constructor({ head = [], colWidths = [], chars = {}, style = {} } = {}) {
    this.head = head;
    this.colWidths = colWidths;
    this.chars = { 
      ...{
        top: '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
        bottom: '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
        left: '|', 'left-mid': '|', mid: '-', 'mid-mid': '+',
        right: '|', 'right-mid': '|', middle: '|'
      }, 
      ...chars 
    };
    this.paddingLeft = style['padding-left'] || 1;
    this.paddingRight = style['padding-right'] || 1;
    this.rows = [];
  }

  push(...rows) {
    this.rows.push(...rows);
  }

  toString() {
    const lines = [];

    const createBorderLine = (position) => {
      if (!this.head.length) return '';
      return this.chars[position + '-left'] + 
             this.head.map((_, i) => this.chars[position].repeat(this.colWidths[i])).join(this.chars[position + '-mid']) + 
             this.chars[position + '-right'];
    };

    const formatRow = (row, isHeader = false) => {
      return row.map((text, i) => 
        text.toString().padEnd(this.colWidths[i] - this.paddingRight).padStart(this.colWidths[i] - this.paddingLeft)
      ).join(this.chars.middle);
    };

    if (this.head.length) {
      lines.push(createBorderLine('top'));
      lines.push(this.chars.left + formatRow(this.head, true) + this.chars.right);
      lines.push(createBorderLine('mid'));
    }

    for (const row of this.rows) {
      const formattedRow = Array.isArray(row) 
        ? formatRow(row) 
        : Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(' ');
      lines.push(this.chars.left + formattedRow + this.chars.right);
    }

    if (this.head.length) {
      lines.push(createBorderLine('bottom'));
    }

    return lines.join('\n');
  }
}

module.exports = Table;

// Example usage
// const Table = require('./cli-table3-rewrite');
// let t = new Table({ head: ['Name', 'Age'], colWidths: [20, 10] });
// t.push(['Alice', 30], ['Bob', 25]);
// console.log(t.toString());
