"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.codeFrameColumns = codeFrameColumns;
exports.default = defaultExport;

const { getChalk, shouldHighlight, default: highlight } = require("@babel/highlight");

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
  const startLine = startLoc.line;
  const endLine = endLoc.line;

  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) start = 0;
  if (endLine === -1) end = source.length;

  const markerLines = {};

  const lineDiff = endLine - startLine;
  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;
      const isFirstLine = i === 0;
      const isLastLine = i === lineDiff;

      if (!startLoc.column) {
        markerLines[lineNumber] = true;
      } else if (isFirstLine) {
        markerLines[lineNumber] = [startLoc.column, source[lineNumber - 1].length - startLoc.column + 1];
      } else if (isLastLine) {
        markerLines[lineNumber] = [0, endLoc.column];
      } else {
        markerLines[lineNumber] = [0, source[lineNumber - i].length];
      }
    }
  } else {
    if (startLoc.column === endLoc.column) {
      markerLines[startLine] = startLoc.column ? [startLoc.column, 0] : true;
    } else {
      markerLines[startLine] = [startLoc.column, endLoc.column - startLoc.column];
    }
  }

  return { start, end, markerLines };
}

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && shouldHighlight(opts);
  const chalk = getChalk(opts);
  const defs = getDefs(chalk);

  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);

  const numberMaxWidth = String(end).length;
  const highlightedLines = highlighted ? highlight(rawLines, opts) : rawLines;
  let frame = highlightedLines.split(NEWLINE).slice(start, end)
    .map((line, index) => {
      const number = start + 1 + index;
      const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
      const gutter = ` ${paddedNumber} | `;
      const hasMarker = markerLines[number];
      const lastMarkerLine = !markerLines[number + 1];

      if (hasMarker) {
        let markerLine = "";

        if (Array.isArray(hasMarker)) {
          const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
          const numberOfMarkers = hasMarker[1] || 1;
          markerLine = "\n " + defs.gutter(gutter.replace(/\d/g, " ")) + markerSpacing + defs.marker("^").repeat(numberOfMarkers);

          if (lastMarkerLine && opts.message) {
            markerLine += " " + defs.message(opts.message);
          }
        }

        return defs.marker(">") + defs.gutter(gutter) + line + markerLine;
      } else {
        return ` ${defs.gutter(gutter)}${line}`;
      }
    }).join("\n");

  if (opts.message && !markerLines[loc.start.line]?.length) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  return highlighted ? chalk.reset(frame) : frame;
}

function defaultExport(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";

    if (process.emitWarning) {
      process.emitWarning(message, "DeprecationWarning");
    } else {
      const deprecationError = new Error(message);
      deprecationError.name = "DeprecationWarning";
      console.warn(new Error(message));
    }
  }

  colNumber = Math.max(colNumber, 0);
  const location = {
    start: {
      column: colNumber,
      line: lineNumber
    }
  };
  return codeFrameColumns(rawLines, location, opts);
}
