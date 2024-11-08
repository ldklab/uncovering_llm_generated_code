"use strict";

import highlight, { shouldHighlight, getChalk } from "@babel/highlight";

function getDefs(chalk) {
  return {
    gutter: chalk.grey,
    marker: chalk.red.bold,
    message: chalk.red.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

function getMarkerLines(loc, source, opts = {}) {
  const startLoc = { column: 0, line: -1, ...loc.start };
  const endLoc = { ...startLoc, ...loc.end };
  const { linesAbove = 2, linesBelow = 3 } = opts;
  let start = Math.max(startLoc.line - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLoc.line + linesBelow);

  if (startLoc.line === -1) start = 0;
  if (endLoc.line === -1) end = source.length;
  
  const markerLines = {};
  if (endLoc.line !== startLoc.line) {
    for (let i = 0; i <= endLoc.line - startLoc.line; i++) {
      const lineNumber = i + startLoc.line;
      if (startLoc.column && i === 0) {
        let sourceLength = source[lineNumber - 1].length;
        markerLines[lineNumber] = [startLoc.column, sourceLength - startLoc.column + 1];
      } else if (i === endLoc.line - startLoc.line) {
        markerLines[lineNumber] = [0, endLoc.column];
      } else {
        let sourceLength = source[lineNumber - i].length;
        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    markerLines[startLoc.line] = startLoc.column === endLoc.column 
      ? startLoc.column ? [startLoc.column, 0] : true 
      : [startLoc.column, endLoc.column - startLoc.column];
  }
  
  return { start, end, markerLines };
}

export function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && shouldHighlight(opts);
  const chalk = getChalk(opts);
  const defs = getDefs(chalk);
  
  const maybeHighlight = (chalkFn, string) => highlighted ? chalkFn(string) : string;
  
  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);
  const numberMaxWidth = String(end).length;

  const highlightedLines = highlighted 
    ? highlight(rawLines, opts) 
    : rawLines;

  let frame = highlightedLines.split(NEWLINE).slice(start, end).map((line, index) => {
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
        markerLine = `\n ${maybeHighlight(defs.gutter, gutter.replace(/\d/g, " "))}${markerSpacing}${maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)}`;
  
        if (lastMarkerLine && opts.message) {
          markerLine += ` ${maybeHighlight(defs.message, opts.message)}`;
        }
      }
      return `${maybeHighlight(defs.marker, ">")}${maybeHighlight(defs.gutter, gutter)}${line}${markerLine}`;
    } 
    return ` ${maybeHighlight(defs.gutter, gutter)}${line}`;
  }).join("\n");

  if (opts.message && !loc.start?.column) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  return highlighted ? chalk.reset(frame) : frame;
}

let deprecationWarningShown = false;

export default function _default(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
    process.emitWarning ? process.emitWarning(message, "DeprecationWarning")
      : console.warn(new Error(message));
  }

  const location = {
    start: { column: Math.max(colNumber, 0), line: lineNumber }
  };
  return codeFrameColumns(rawLines, location, opts);
}
