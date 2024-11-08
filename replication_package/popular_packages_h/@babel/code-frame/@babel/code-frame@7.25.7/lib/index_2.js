"use strict";

const { highlight, shouldHighlight } = require("@babel/highlight");
const picocolors = require("picocolors");

function importWildcard(obj, useCache = false) {
  if (typeof WeakMap !== "function") return obj;
  if (obj && obj.__esModule) return obj;
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return { default: obj };

  const cache = useCache ? new WeakMap() : new WeakMap();
  if (cache.has(obj)) return cache.get(obj);

  const result = { __proto__: null };
  for (const key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  result.default = obj;
  cache.set(obj, result);

  return result;
}

const useColor = () => {
  if (typeof process !== "object") return picocolors;

  const forceColor = process.env.FORCE_COLOR;
  if (forceColor === "0" || forceColor === "false") {
    return picocolors.createColors(false);
  }

  return picocolors;
};

const compose = (f, g) => v => f(g(v));
let cachedColors;

function getColor(forceColor) {
  if (forceColor) {
    if (!cachedColors) {
      cachedColors = picocolors.createColors(true);
    }
    return cachedColors;
  }
  return useColor()();
}

function getDefs(colors) {
  return {
    gutter: colors.gray,
    marker: compose(colors.red, colors.bold),
    message: compose(colors.red, colors.bold),
  };
}

const NEW_LINE_REGEX = /\r\n|[\n\r\u2028\u2029]/;

function computeMarkerLines(loc, source, { linesAbove = 2, linesBelow = 3 } = {}) {
  const { start, end } = { start: { column: 0, line: -1 }, end: { ...({ column: 0, line: 0 }), ...(loc.end || {}) } };

  let startIndex = Math.max(start.line - (linesAbove + 1), 0);
  let endIndex = Math.min(source.length, end.line + linesBelow);

  if (start.line === -1) startIndex = 0;
  if (end.line === -1) endIndex = source.length;

  const markerLines = {};
  for (let i = 0; i <= end.line - start.line; i++) {
    const lineNum = start.line + i;
    if (!start.column) {
      markerLines[lineNum] = true;
    } else if (i === 0) {
      const lineLength = source[lineNum - 1].length;
      markerLines[lineNum] = [start.column, lineLength - start.column + 1];
    } else if (i === end.line - start.line) {
      markerLines[lineNum] = [0, end.column];
    } else {
      const lineLength = source[lineNum - i].length;
      markerLines[lineNum] = [0, lineLength];
    }
  }

  return { start: startIndex, end: endIndex, markerLines: markerLines };
}

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlightFlag = (opts.highlightCode || opts.forceColor) && shouldHighlight(opts);
  const colorFns = getColor(opts.forceColor);
  const defs = getDefs(colorFns);
  const maybeHighlight = colorItem => (highlightFlag ? colorFns.bold(colorItem) : colorItem);

  const lines = rawLines.split(NEW_LINE_REGEX);
  const { start, end, markerLines } = computeMarkerLines(loc, lines, opts);
  const hasCols = loc.start && typeof loc.start.column === "number";

  const numberWidth = String(end).length;
  const highlightedContent = highlightFlag ? highlight(rawLines, opts) : rawLines;
  let frame = highlightedContent
    .split(NEW_LINE_REGEX, end)
    .slice(start, end)
    .map((line, index) => {
      const number = start + 1 + index;
      const paddedNumber = ` ${number}`.slice(-numberWidth);
      const gutter = ` ${paddedNumber} |`;
      const markerExists = markerLines[number];
      const lastMarker = !markerLines[number + 1];

      if (markerExists) {
        let markerLine = "";
        if (Array.isArray(markerExists)) {
          const padding = line.slice(0, Math.max(markerExists[0] - 1, 0)).replace(/[^\t]/g, " ");
          const numberOfMarkers = markerExists[1] || 1;
          markerLine = `\n ${maybeHighlight(defs.gutter, gutter.replace(/\d/g, " "))} ${padding}${maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)}`;

          if (lastMarker && opts.message) {
            markerLine += ` ${maybeHighlight(defs.message, opts.message)}`;
          }
        }
        return `>${maybeHighlight(defs.gutter, gutter)}${line ? ` ${line}` : ""}${markerLine}`;
      } else {
        return ` ${maybeHighlight(defs.gutter, gutter)}${line ? ` ${line}` : ""}`;
      }
    })
    .join("\n");

  if (opts.message && !hasCols) {
    frame = `${" ".repeat(numberWidth + 1)}${opts.message}\n${frame}`;
  }

  return highlightFlag ? colorFns.reset(frame) : frame;
}

function generateCodeFrame(rawLines, line, column, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const warnMsg = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
    if (process.emitWarning) {
      process.emitWarning(warnMsg, "DeprecationWarning");
    } else {
      console.warn(new Error(warnMsg).stack);
    }
  }
  
  column = Math.max(column, 0);
  const location = { start: { column: column, line: line } };

  return codeFrameColumns(rawLines, location, opts);
}

exports.codeFrameColumns = codeFrameColumns;
exports.default = generateCodeFrame;
