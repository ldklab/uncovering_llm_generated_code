'use strict';

const ESC = '\x1B';
const CSI = `${ESC}[`;
const beep = '\u0007';

const cursorControls = {
  to(positionX, positionY) {
    if (positionY === undefined) return `${CSI}${positionX + 1}G`;
    return `${CSI}${positionY + 1};${positionX + 1}H`;
  },
  move(deltaX, deltaY) {
    let sequence = '';

    if (deltaX < 0) sequence += `${CSI}${-deltaX}D`;
    else if (deltaX > 0) sequence += `${CSI}${deltaX}C`;

    if (deltaY < 0) sequence += `${CSI}${-deltaY}A`;
    else if (deltaY > 0) sequence += `${CSI}${deltaY}B`;

    return sequence;
  },
  up: (steps = 1) => `${CSI}${steps}A`,
  down: (steps = 1) => `${CSI}${steps}B`,
  forward: (steps = 1) => `${CSI}${steps}C`,
  backward: (steps = 1) => `${CSI}${steps}D`,
  nextLine: (steps = 1) => `${CSI}E`.repeat(steps),
  prevLine: (steps = 1) => `${CSI}F`.repeat(steps),
  left: `${CSI}G`,
  hide: `${CSI}?25l`,
  show: `${CSI}?25h`,
  save: `${ESC}7`,
  restore: `${ESC}8`
};

const scrollingControls = {
  up: (lines = 1) => `${CSI}S`.repeat(lines),
  down: (lines = 1) => `${CSI}T`.repeat(lines)
};

const eraseControls = {
  screen: `${CSI}2J`,
  up: (times = 1) => `${CSI}1J`.repeat(times),
  down: (times = 1) => `${CSI}J`.repeat(times),
  line: `${CSI}2K`,
  lineEnd: `${CSI}K`,
  lineStart: `${CSI}1K`,
  lines(number) {
    let output = '';
    for (let index = 0; index < number; index++) {
      output += this.line + (index < number - 1 ? cursorControls.up() : '');
    }
    if (number) {
      output += cursorControls.left;
    }
    return output;
  }
};

module.exports = { cursor: cursorControls, scroll: scrollingControls, erase: eraseControls, beep };
