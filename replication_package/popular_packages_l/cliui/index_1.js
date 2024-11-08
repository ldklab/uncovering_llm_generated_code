const util = require('util');

class CLIUI {
  constructor(options = {}) {
    this.options = options;
    this.width = options.width || 80;
    this.wrap = options.wrap !== undefined ? options.wrap : true;
    this.rows = [];
  }

  div(...cols) {
    this.rows.push(cols);
  }

  span(...cols) {
    if (this.rows.length === 0) this.div(...cols);
    else this.rows[this.rows.length - 1].push(...cols);
  }

  resetOutput() {
    this.rows = [];
  }

  toString() {
    let output = '';

    for (const row of this.rows) {
      const rowOutput = [];

      for (const col of row) {
        const text = typeof col === 'string' ? col : col.text || '';
        const width = typeof col === 'object' && col.width ? col.width : this.width / row.length;
        const padding = typeof col === 'object' && col.padding ? col.padding : [0, 0, 0, 0];
        const align = typeof col === 'object' && col.align ? col.align : 'left';

        const paddedText = ' '.repeat(padding[3]) + text + ' '.repeat(padding[1]);
        const wrappedText = this.wrapText(paddedText, width);
        const alignedText = this.alignText(wrappedText, width, align);

        rowOutput.push(alignedText);
      }

      output += rowOutput.join('') + '\n';
    }
    
    return output;
  }

  wrapText(text, width) {
    if (!this.wrap) return text;
    const regex = new RegExp(`(.{1,${width}})(\\s+|$)`, 'g');
    return text.match(regex).join('\n');
  }

  alignText(text, width, align) {
    const lines = text.split('\n');
    return lines.map(line => {
      const spaces = width - line.length;
      if (align === 'right') return ' '.repeat(spaces) + line;
      if (align === 'center') return ' '.repeat(spaces / 2) + line + ' '.repeat(spaces / 2);
      return line + ' '.repeat(spaces);
    }).join('');
  }

  static create(options) {
    return new CLIUI(options);
  }
}

// Export factory function to create a new CLIUI instance
module.exports = function (options) {
  return CLIUI.create(options);
};
