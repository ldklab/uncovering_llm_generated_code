const ESC = '\u001B[';

// Cursor Operations
const cursor = {
  to(x, y) {
    return `${ESC}${y};${x}H`;
  },
  move(x, y) {
    let commands = '';
    if (x < 0) commands += `${ESC}${-x}D`;
    else if (x > 0) commands += `${ESC}${x}C`;
    
    if (y < 0) commands += `${ESC}${-y}A`;
    else if (y > 0) commands += `${ESC}${y}B`;
    
    return commands;
  },
  up(steps = 1) {
    return `${ESC}${steps}A`;
  },
  down(steps = 1) {
    return `${ESC}${steps}B`;
  },
  forward(steps = 1) {
    return `${ESC}${steps}C`;
  },
  backward(steps = 1) {
    return `${ESC}${steps}D`;
  },
  nextLine(lines = 1) {
    return `${ESC}E`.repeat(lines);
  },
  prevLine(lines = 1) {
    return `${ESC}F`.repeat(lines);
  },
  left: `${ESC}G`,
  hide: `${ESC}?25l`,
  show: `${ESC}?25h`,
  save: `${ESC}s`,
  restore: `${ESC}u`
};

// Scrolling Operations
const scroll = {
  up(lines = 1) {
    return `${ESC}${lines}S`;
  },
  down(lines = 1) {
    return `${ESC}${lines}T`;
  }
};

// Erasing Operations
const erase = {
  screen: `${ESC}2J${ESC}H`,
  up(lines = 1) {
    return `${ESC}1J`.repeat(lines);
  },
  down(lines = 1) {
    return `${ESC}J`.repeat(lines);
  },
  line: `${ESC}2K`,
  lineEnd: `${ESC}K`,
  lineStart: `${ESC}1K`,
  lines(count) {
    return `${ESC}1M`.repeat(count) + cursor.left;
  }
};

module.exports = { cursor, scroll, erase };
