// sisteransi package implementation

const ESC = '\u001B[';

// Cursor Commands
const cursor = {
  to(x, y) {
    return `${ESC}${y};${x}H`;
  },
  move(x, y) {
    let result = '';
    if (x < 0) result += `${ESC}${-x}D`;
    else if (x > 0) result += `${ESC}${x}C`;

    if (y < 0) result += `${ESC}${-y}A`;
    else if (y > 0) result += `${ESC}${y}B`;

    return result;
  },
  up(count = 1) {
    return `${ESC}${count}A`;
  },
  down(count = 1) {
    return `${ESC}${count}B`;
  },
  forward(count = 1) {
    return `${ESC}${count}C`;
  },
  backward(count = 1) {
    return `${ESC}${count}D`;
  },
  nextLine(count = 1) {
    return `${ESC}E`.repeat(count);
  },
  prevLine(count = 1) {
    return `${ESC}F`.repeat(count);
  },
  left: `${ESC}G`,
  hide: `${ESC}?25l`,
  show: `${ESC}?25h`,
  save: `${ESC}s`,
  restore: `${ESC}u`
};

// Scroll commands
const scroll = {
  up(count = 1) {
    return `${ESC}${count}S`;
  },
  down(count = 1) {
    return `${ESC}${count}T`;
  }
};

// Erase Commands
const erase = {
  screen: `${ESC}2J${ESC}H`,
  up(count = 1) {
    return `${ESC}1J`.repeat(count);
  },
  down(count = 1) {
    return `${ESC}J`.repeat(count);
  },
  line: `${ESC}2K`,
  lineEnd: `${ESC}K`,
  lineStart: `${ESC}1K`,
  lines(count) {
    return `${ESC}1M`.repeat(count) + cursor.left;
  }
};

module.exports = { cursor, scroll, erase };
