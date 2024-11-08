const ESC = '\u001B[';

const cursor = {
  to: (x, y) => `${ESC}${y};${x}H`,
  move(x, y) {
    let result = '';
    if (x) result += `${ESC}${Math.abs(x)}${x > 0 ? 'C' : 'D'}`;
    if (y) result += `${ESC}${Math.abs(y)}${y > 0 ? 'B' : 'A'}`;
    return result;
  },
  up: (count = 1) => `${ESC}${count}A`,
  down: (count = 1) => `${ESC}${count}B`,
  forward: (count = 1) => `${ESC}${count}C`,
  backward: (count = 1) => `${ESC}${count}D`,
  nextLine: (count = 1) => `${ESC}E`.repeat(count),
  prevLine: (count = 1) => `${ESC}F`.repeat(count),
  left: `${ESC}G`,
  hide: `${ESC}?25l`,
  show: `${ESC}?25h`,
  save: `${ESC}s`,
  restore: `${ESC}u`
};

const scroll = {
  up: (count = 1) => `${ESC}${count}S`,
  down: (count = 1) => `${ESC}${count}T`
};

const erase = {
  screen: `${ESC}2J${ESC}H`,
  up: (count = 1) => `${ESC}1J`.repeat(count),
  down: (count = 1) => `${ESC}J`.repeat(count),
  line: `${ESC}2K`,
  lineEnd: `${ESC}K`,
  lineStart: `${ESC}1K`,
  lines: (count) => `${ESC}1M`.repeat(count) + cursor.left
};

module.exports = { cursor, scroll, erase };
