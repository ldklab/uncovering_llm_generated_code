"use strict";

import { highlight, shouldHighlight } from "@babel/highlight";
import * as picocolors from "picocolors";

export { codeFrameColumns };

export default function _default(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated. Please use `codeFrameColumns`.";
    if (process.emitWarning) {
      process.emitWarning(message, "DeprecationWarning");
    } else {
      console.warn(new Error(message));
    }
  }
  const location = { start: { column: Math.max(colNumber, 0), line: lineNumber } };
  return codeFrameColumns(rawLines, location, opts);
}

const colors = (typeof process === "object" && (process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false"))
  ? picocolors.createColors(false)
  : picocolors;
let pcWithForcedColor;
let deprecationWarningShown = false;

function getColors(forceColor) {
  if (forceColor) {
    pcWithForcedColor = pcWithForcedColor || picocolors.createColors(true);
    return pcWithForcedColor;
  }
  return colors;
}

function getDefs(colors) {
  return {
    gutter: colors.gray,
    marker: compose(colors.red, colors.bold),
    message: compose(colors.red, colors.bold),
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

function compose(f, g) {
  return v => f(g(v));
}

function getMarkerLines(loc, source, { linesAbove = 2, linesBelow = 3 } = {}) {
  const startLoc = { column: 0, line: -1, ...loc.start };
  const endLoc = { ...startLoc, ...loc.end };
  const start = Math.max(startLoc.line - (linesAbove + 1), 0);
  const end = Math.min(source.length, endLoc.line + linesBelow);
  
  const markerLines = {};
  const lineDiff = endLoc.line - startLoc.line;
  
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
        markerLines[lineNumber] = [0, source[lineNumber - i].length];
      }
    }
  } else {
    if (startLoc.column === endLoc.column) {
      markerLines[startLoc.line] = startLoc.column ? [startLoc.column, 0] : true;
    } else {
      markerLines[startLoc.line] = [startLoc.column, endLoc.column - startLoc.column];
    }
  }
  
  return { start, end, markerLines };
}

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && shouldHighlight(opts);
  const colors = getColors(opts.forceColor);
  const defs = getDefs(colors);

  const maybeHighlight = (fmt, string) => (highlighted ? fmt(string) : string);

  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);
  const hasColumns = loc.start && typeof loc.start.column === "number";

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
          markerLine = [
            "\n ",
            maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")),
            " ",
            markerSpacing,
            maybeHighlight(defs.marker, "^").repeat(numberOfMarkers),
          ].join("");
          if (lastMarkerLine && opts.message) {
            markerLine += " " + maybeHighlight(defs.message, opts.message);
          }
        }
        return [
          maybeHighlight(defs.marker, ">"),
          maybeHighlight(defs.gutter, gutter),
          line.length > 0 ? ` ${line}` : "",
          markerLine,
        ].join("");
      } else {
        return ` ${maybeHighlight(defs.gutter, gutter)}${line.length > 0 ? ` ${line}` : ""}`;
      }
    })
    .join("\n");

  if (opts.message && !hasColumns) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  return highlighted ? colors.reset(frame) : frame;
}
