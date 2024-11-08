const util = require('util');

class CLIUI {
  constructor({ width = 80, wrap = true } = {}) {
    this.width = width;
    this.wrap = wrap;
    this.rows = [];
  }

  div(...columns) {
    this.rows.push(columns);
  }

  span(...columns) {
    if (this.rows.length === 0) {
      this.div(...columns);
    } else {
      this.rows[this.rows.length - 1].push(...columns);
    }
  }

  resetOutput() {
    this.rows = [];
  }

  toString() {
    return this.rows.map(row => {
      return row.map(col => {
        const text = typeof col === 'string' ? col : col.text || '';
        const colWidth = typeof col === 'object' && col.width ? col.width : this.width / row.length;
        const padding = typeof col === 'object' && col.padding ? col.padding : [0, 0, 0, 0];
        const align = typeof col === 'object' && col.align ? col.align : 'left';

        const paddedText = ' '.repeat(padding[3]) + text + ' '.repeat(padding[1]);
        const wrappedText = this.wrapText(paddedText, colWidth);
        return this.alignText(wrappedText, colWidth, align);
      }).join('');
    }).join('\n') + '\n';
  }

  wrapText(text, width) {
    if (!this.wrap) return text;
    const regex = new RegExp(`(.{1,${width}})(\\s+|$)`, 'g');
    return text.match(regex).join('\n');
  }

  alignText(text, width, align) {
    const lines = text.split('\n');
    return lines.map(line => {
      const extraSpaces = width - line.length;
      switch (align) {
        case 'right':
          return ' '.repeat(extraSpaces) + line;
        case 'center':
          return ' '.repeat(Math.floor(extraSpaces / 2)) + line + ' '.repeat(Math.ceil(extraSpaces / 2));
        default:
          return line + ' '.repeat(extraSpaces);
      }
    }).join('');
  }

  static create(options) {
    return new CLIUI(options);
  }
}

module.exports = function (options) {
  return CLIUI.create(options);
};
