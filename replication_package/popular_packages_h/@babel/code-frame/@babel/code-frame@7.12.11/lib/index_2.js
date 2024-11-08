"use strict";

const { default: highlight, shouldHighlight, getChalk } = require("@babel/highlight");

let deprecationWarningShown = false;

function getDefs(chalk) {
  return {
    gutter: chalk.grey,
    marker: chalk.red.bold,
    message: chalk.red.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

function getMarkerLines(loc, source, opts) {
  const startLoc = { column: 0, line: -1, ...loc.start };
  const endLoc = { ...startLoc, ...loc.end };
  const { linesAbove = 2, linesBelow = 3 } = opts || {};
  const start = Math.max(startLoc.line - (linesAbove + 1), 0);
  const end = Math.min(source.length, endLoc.line + linesBelow);

  const lineDiff = endLoc.line - startLoc.line;
  const markerLines = {};

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLoc.line;
      if (!startLoc.column) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;
        markerLines[lineNumber] = [startLoc.column, sourceLength - startLoc.column + 1];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endLoc.column];
      } else {
        const sourceLength = source[lineNumber - i].length;
        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startLoc.column === endLoc.column) {
      markerLines[startLoc.line] = [startLoc.column, 0];
    } else {
      markerLines[startLoc.line] = [startLoc.column, endLoc.column - startLoc.column];
    }
  }

  return { start, end, markerLines };
}

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && shouldHighlight(opts);
  const chalk = getChalk(opts);
  const defs = getDefs(chalk);

  const maybeHighlight = (chalkFn, string) => highlighted ? chalkFn(string) : string;

  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);
  const hasColumns = loc.start && typeof loc.start.column === "number";
  const numberMaxWidth = String(end).length;
  const highlightedLines = highlighted ? highlight(rawLines, opts) : rawLines;

  let frame = highlightedLines.split(NEWLINE).slice(start, end).map((line, index) => {
    const number = start + 1 + index;
    const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
    const gutter = ` ${paddedNumber} | `;
    const hasMarker = markerLines[number];
    const lastMarkerLine = !markerLines[number + 1];

    if (hasMarker) {
      let markerLine = "";
      if (Array.isArray(hasMarker)) {
        const markerSpacing = line.slice(0, hasMarker[0] - 1).replace(/[^\t]/g, " ");
        const numberOfMarkers = hasMarker[1] || 1;
        markerLine = `\n ${maybeHighlight(defs.gutter, gutter.replace(/\d/g, " "))}${markerSpacing}${maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)}`;
        if (lastMarkerLine && opts.message) {
          markerLine += " " + maybeHighlight(defs.message, opts.message);
        }
      }
      return [maybeHighlight(defs.marker, ">"), maybeHighlight(defs.gutter, gutter), line, markerLine].join("");
    } else {
      return ` ${maybeHighlight(defs.gutter, gutter)}${line}`;
    }
  }).join("\n");

  if (opts.message && !hasColumns) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  return highlighted ? chalk.reset(frame) : frame;
}

function _default(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
    if (process.emitWarning) {
      process.emitWarning(message, "DeprecationWarning");
    } else {
      const deprecationError = new Error(message);
      deprecationError.name = "DeprecationWarning";
      console.warn(message);
    }
  }

  colNumber = Math.max(colNumber, 0);
  const location = { start: { column: colNumber, line: lineNumber } };
  return codeFrameColumns(rawLines, location, opts);
}

module.exports = { codeFrameColumns, default: _default };
