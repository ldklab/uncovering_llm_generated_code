"use strict";

const { highlight, shouldHighlight } = require("@babel/highlight");
const picoColors = require("picocolors");

let pcWithForcedColor = undefined;
let deprecationWarningShown = false;

function getColors(forceColor) {
  if (forceColor) {
    if (!pcWithForcedColor) {
      pcWithForcedColor = picoColors.createColors(true);
    }
    return pcWithForcedColor;
  }
  return process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false" 
    ? picoColors.createColors(false) 
    : picoColors;
}

function getDefs(colors) {
  return {
    gutter: colors.gray,
    marker: str => colors.bold(colors.red(str)),
    message: str => colors.bold(colors.red(str)),
  };
}

function getMarkerLines(loc, source, opts) {
  const startLoc = { column: 0, line: -1, ...loc.start };
  const endLoc = { ...startLoc, ...loc.end };
  const { linesAbove = 2, linesBelow = 3 } = opts || {};
  const startLine = startLoc.line;
  const startColumn = startLoc.column;
  const endLine = endLoc.line;
  const endColumn = endLoc.column;
  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) start = 0;
  if (endLine === -1) end = source.length;

  const lineDiff = endLine - startLine;
  const markerLines = {};

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;
      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;
        markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i].length;
        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startColumn === endColumn) {
      markerLines[startLine] = startColumn ? [startColumn, 0] : true;
    } else {
      markerLines[startLine] = [startColumn, endColumn - startColumn];
    }
  }

  return { start, end, markerLines };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && shouldHighlight(opts);
  const colors = getColors(opts.forceColor);
  const defs = getDefs(colors);

  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);
  const numberMaxWidth = String(end).length;
  
  const highlightedLines = highlighted ? highlight(rawLines, opts) : rawLines;
  let frame = highlightedLines
    .split(NEWLINE, end)
    .slice(start, end)
    .map((line, index) => {
      const number = start + 1 + index;
      const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
      const gutter = ` ${paddedNumber} |`;
      const hasMarker = markerLines[number];
      const lastMarkerLine = !markerLines[number + 1];

      if (hasMarker) {
        let markerLine = "";
        if (Array.isArray(hasMarker)) {
          const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
          const numberOfMarkers = hasMarker[1] || 1;
          markerLine = `\n ${defs.gutter(gutter.replace(/\d/g, " "))} ${markerSpacing}${defs.marker("^").repeat(numberOfMarkers)}`;
          if (lastMarkerLine && opts.message) {
            markerLine += ` ${defs.message(opts.message)}`;
          }
        }
        return `${defs.marker(">")}${defs.gutter(gutter)} ${line.length > 0 ? ` ${line}` : ""}${markerLine}`;
      } else {
        return ` ${defs.gutter(gutter)}${line.length > 0 ? ` ${line}` : ""}`;
      }
    })
    .join("\n");

  if (opts.message && !loc.start?.column) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }
  
  return highlighted ? colors.reset(frame) : frame;
}

function deprecatedCodeFrame(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
    if (process.emitWarning) {
      process.emitWarning(message, "DeprecationWarning");
    } else {
      console.warn(`DeprecationWarning: ${message}`);
    }
  }

  colNumber = Math.max(colNumber, 0);
  const location = { start: { column: colNumber, line: lineNumber } };
  return codeFrameColumns(rawLines, location, opts);
}

exports.codeFrameColumns = codeFrameColumns;
exports.default = deprecatedCodeFrame;
