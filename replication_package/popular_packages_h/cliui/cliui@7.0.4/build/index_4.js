'use strict';

const alignFunctions = {
    right: rightAlignText,
    center: centerAlignText
};

const positionIndices = { top: 0, right: 1, bottom: 2, left: 3 };

class UserInterface {
    constructor(options) {
        this.width = options.width;
        this.wrap = options.wrap !== undefined ? options.wrap : true;
        this.rows = [];
    }

    createRowSpan(...args) {
        const columns = this.createRow(...args);
        columns.span = true;
    }

    clearOutput() {
        this.rows = [];
    }

    createRow(...args) {
        if (args.length === 0) {
            this.createRow('');
        }
        if (this.wrap && this.needsLayoutDSL(...args) && typeof args[0] === 'string') {
            return this.processLayoutDSL(args[0]);
        }
        const columns = args.map(arg => typeof arg === 'string' ? this.columnFromString(arg) : arg);
        this.rows.push(columns);
        return columns;
    }

    needsLayoutDSL(...args) {
        return args.length === 1 && typeof args[0] === 'string' && /[\t\n]/.test(args[0]);
    }

    processLayoutDSL(layoutStr) {
        const rows = layoutStr.split('\n').map(row => row.split('\t'));
        let maxLeftColumnWidth = 0;

        rows.forEach(columns => {
            if (columns.length > 1 && mixin.stringWidth(columns[0]) > maxLeftColumnWidth) {
                maxLeftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin.stringWidth(columns[0]));
            }
        });

        rows.forEach(columns => {
            this.createRow(...columns.map((colStr, index) => ({
                text: colStr.trim(),
                padding: this.calculatePadding(colStr),
                width: (index === 0 && columns.length > 1) ? maxLeftColumnWidth : undefined
            })));
        });

        return this.rows[this.rows.length - 1];
    }

    columnFromString(text) {
        return { text, padding: this.calculatePadding(text) };
    }

    calculatePadding(text) {
        const cleanText = mixin.stripAnsi(text);
        return [0, cleanText.match(/\s*$/)[0].length, 0, cleanText.match(/^\s*/)[0].length];
    }

    toString() {
        const lines = [];
        this.rows.forEach(row => {
            this.convertRowToString(row, lines);
        });
        return lines
            .filter(line => !line.hidden)
            .map(line => line.text)
            .join('\n');
    }

    convertRowToString(row, lines) {
        this.mapRowToRasterized(row).forEach((rasterRow, r) => {
            let rowStr = '';
            rasterRow.forEach((col, c) => {
                const colInfo = row[c];
                const wrapWidth = this.adjustPadding(colInfo);
                let tempStr = col;

                if (wrapWidth > mixin.stringWidth(col)) {
                    tempStr += ' '.repeat(wrapWidth - mixin.stringWidth(col));
                }

                if (colInfo.align && colInfo.align !== 'left' && this.wrap) {
                    const alignmentFunction = alignFunctions[colInfo.align];
                    tempStr = alignmentFunction(tempStr, wrapWidth);
                    if (mixin.stringWidth(tempStr) < wrapWidth) {
                        tempStr += ' '.repeat((colInfo.width || 0) - mixin.stringWidth(tempStr) - 1);
                    }
                }

                const pad = colInfo.padding || [0, 0, 0, 0];
                if (pad[positionIndices.left]) {
                    rowStr += ' '.repeat(pad[positionIndices.left]);
                }

                rowStr += applyBorder(colInfo, tempStr, '| ');
                rowStr += tempStr;
                rowStr += applyBorder(colInfo, tempStr, ' |');

                if (pad[positionIndices.right]) {
                    rowStr += ' '.repeat(pad[positionIndices.right]);
                }

                if (r === 0 && lines.length > 0) {
                    rowStr = this.inlineRender(rowStr, lines[lines.length - 1]);
                }
            });

            lines.push({
                text: rowStr.replace(/ +$/, ''),
                span: row.span
            });
        });
    }

    inlineRender(newLine, previousLine) {
        const match = newLine.match(/^ */);
        const leadingWhiteSpace = match ? match[0].length : 0;
        const targetText = previousLine.text;
        const adjustedTextWidth = mixin.stringWidth(targetText.trimRight());

        if (!previousLine.span) return newLine;

        if (!this.wrap) {
            previousLine.hidden = true;
            return targetText + newLine;
        }

        if (leadingWhiteSpace < adjustedTextWidth) {
            return newLine;
        }
        
        previousLine.hidden = true;
        return (
            targetText.trimRight() + ' '.repeat(leadingWhiteSpace - adjustedTextWidth) + newLine.trimLeft()
        );
    }

    mapRowToRasterized(row) {
        const rasterRows = [];
        const columnWidths = this.calculateColumnWidths(row);

        row.forEach((col, c) => {
            col.width = columnWidths[c];
            let wrappedText = this.wrap
                ? mixin.wrap(col.text, this.adjustPadding(col), { hard: true }).split('\n')
                : col.text.split('\n');

            if (col.border) {
                wrappedText.unshift('.' + '-'.repeat(this.adjustPadding(col) + 2) + '.');
                wrappedText.push("'" + '-'.repeat(this.adjustPadding(col) + 2) + "'");
            }

            if (col.padding) {
                wrappedText.unshift(...new Array(col.padding[positionIndices.top] || 0).fill(''));
                wrappedText.push(...new Array(col.padding[positionIndices.bottom] || 0).fill(''));
            }

            wrappedText.forEach((line, r) => {
                if (!rasterRows[r]) rasterRows.push([]);
                const rasterRow = rasterRows[r];
                for (let i = 0; i < c; i++) {
                    if (rasterRow[i] === undefined) rasterRow.push('');
                }
                rasterRow.push(line);
            });
        });

        return rasterRows;
    }

    adjustPadding(col) {
        let width = col.width || 0;
        if (col.padding) {
            width -= (col.padding[positionIndices.left] || 0) + (col.padding[positionIndices.right] || 0);
        }
        if (col.border) {
            width -= 4;
        }
        return width;
    }

    calculateColumnWidths(row) {
        if (!this.wrap) {
            return row.map(col => col.width || mixin.stringWidth(col.text));
        }

        let unspecifiedCount = row.length;
        let availableWidth = this.width;

        const assignedWidths = row.map(col => {
            if (col.width) {
                unspecifiedCount--;
                availableWidth -= col.width;
                return col.width;
            }
            return undefined;
        });

        const defaultWidth = unspecifiedCount ? Math.floor(availableWidth / unspecifiedCount) : 0;

        return assignedWidths.map((assignedWidth, i) => (assignedWidth === undefined ? Math.max(defaultWidth, minColumnWidth(row[i])) : assignedWidth));
    }
}

function applyBorder(col, textStr, style) {
    if (col.border) {
        if (/[.']-+[.']/.test(textStr)) return '';
        if (textStr.trim().length !== 0) return style;
        return '  ';
    }
    return '';
}

function minColumnWidth(col) {
    const pad = col.padding || [];
    const minBaseWidth = 1 + (pad[positionIndices.left] || 0) + (pad[positionIndices.right] || 0);
    return col.border ? minBaseWidth + 4 : minBaseWidth;
}

function getTerminalWidth() {
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
        return process.stdout.columns;
    }
    return 80;
}

function rightAlignText(str, w) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    return strWidth < w ? ' '.repeat(w - strWidth) + str : str;
}

function centerAlignText(str, w) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    if (strWidth >= w) {
        return str;
    }
    return ' '.repeat((w - strWidth) >> 1) + str;
}

let mixin;
function createCLIUI(options, interfaceMixin) {
    mixin = interfaceMixin;
    return new UserInterface({
        width: options?.width || getTerminalWidth(),
        wrap: options?.wrap
    });
}

const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const wrap = require('wrap-ansi');

function ui(options) {
    return createCLIUI(options, {
        stringWidth,
        stripAnsi,
        wrap
    });
}

module.exports = ui;
