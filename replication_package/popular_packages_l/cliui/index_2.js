const util = require('util');

class CLIUI {
  constructor(options = {}) {
    this.options = options;
    this.width = options.width || 80; // Set default width to 80 if not provided
    this.wrap = options.wrap !== undefined ? options.wrap : true; // Enable wrapping by default
    this.rows = []; // Initialize rows as an empty array
  }

  // Method to add a new row with specified columns
  div(...cols) {
    this.rows.push(cols);
  }

  // Method to add columns to the last row, or create one if none exists
  span(...cols) {
    if (this.rows.length === 0) {
      this.div(...cols);
    } else {
      this.rows[this.rows.length - 1].push(...cols);
    }
  }

  // Method to clear all rows
  resetOutput() {
    this.rows = [];
  }

  // Generate the formatted string representation of all rows
  toString() {
    let output = '';

    // Iterate over each row
    for (const row of this.rows) {
      const rowOutput = [];

      // Process each column in the row
      for (const col of row) {
        const textContent = typeof col === 'string' ? col : col.text || '';
        const columnWidth = typeof col === 'object' && col.width ? col.width : this.width / row.length;
        const padding = typeof col === 'object' && col.padding ? col.padding : [0, 0, 0, 0];
        const alignment = typeof col === 'object' && col.align ? col.align : 'left';

        const paddedText = ' '.repeat(padding[3]) + textContent + ' '.repeat(padding[1]);
        const wrappedText = this.wrapText(paddedText, columnWidth);
        const alignedText = this.alignText(wrappedText, columnWidth, alignment);

        rowOutput.push(alignedText);
      }

      output += rowOutput.join('') + '\n';
    }
    
    return output;
  }

  // Helper method to handle text wrapping
  wrapText(text, width) {
    if (!this.wrap) return text;
    const regex = new RegExp(`(.{1,${width}})(\\s+|$)`, 'g');
    return text.match(regex).join('\n');
  }

  // Helper method to handle text alignment
  alignText(text, width, align) {
    const lines = text.split('\n');
    return lines.map(line => {
      const spaces = width - line.length;
      if (align === 'right') return ' '.repeat(spaces) + line;
      if (align === 'center') return ' '.repeat(Math.floor(spaces / 2)) + line + ' '.repeat(Math.ceil(spaces / 2));
      return line + ' '.repeat(spaces);
    }).join('');
  }

  // Static method to create a new instance
  static create(options) {
    return new CLIUI(options);
  }
}

// Export a function to create a new CLIUI instance
module.exports = function (options) {
  return CLIUI.create(options);
};
