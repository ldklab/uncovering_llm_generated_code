'use strict';

const alignmentMethods = {
    right: alignTextRight,
    center: alignTextCenter
};

const UI_PADDING = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3
};

class UserInterface {
    constructor(options) {
        this.width = options.width;
        this.wrap = options.wrap !== undefined ? options.wrap : true;
        this.rows = [];
    }

    addSpan(...args) {
        const columns = this.addDiv(...args);
        columns.span = true;
    }

    clearOutput() {
        this.rows = [];
    }

    addDiv(...args) {
        if (args.length === 0) {
            this.addDiv('');
        }

        if (this.wrap && this.isLayoutDSL(...args) && typeof args[0] === 'string') {
            return this.parseLayoutDSL(args[0]);
        }

        const columns = args.map(arg => {
            if (typeof arg === 'string') {
                return this.createColumnFromString(arg);
            }
            return arg;
        });

        this.rows.push(columns);
        return columns;
    }

    isLayoutDSL(...args) {
        return args.length === 1 && typeof args[0] === 'string' && /[\t\n]/.test(args[0]);
    }

    parseLayoutDSL(inputStr) {
        const parsedRows = inputStr.split('\n').map(row => row.split('\t'));
        let maxLeftColumnWidth = 0;

        parsedRows.forEach(columns => {
            if (columns.length > 1 && mixin.stringWidth(columns[0]) > maxLeftColumnWidth) {
                maxLeftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin.stringWidth(columns[0]));
            }
        });

        parsedRows.forEach(columns => {
            this.addDiv(...columns.map((content, index) => ({
                text: content.trim(),
                padding: this.calculatePadding(content),
                width: (index === 0 && columns.length > 1) ? maxLeftColumnWidth : undefined
            })));
        });

        return this.rows[this.rows.length - 1];
    }

    createColumnFromString(text) {
        return {
            text,
            padding: this.calculatePadding(text)
        };
    }

    calculatePadding(str) {
        const textWithoutAnsi = mixin.stripAnsi(str);
        return [
            0,
            textWithoutAnsi.match(/\s*$/)[0].length,
            0,
            textWithoutAnsi.match(/^\s*/)[0].length
        ];
    }

    toString() {
        const outputLines = [];
        this.rows.forEach(row => {
            this.convertRowToString(row, outputLines);
        });
        return outputLines
            .filter(line => !line.hidden)
            .map(line => line.text)
            .join('\n');
    }

    convertRowToString(row, lines) {
        this.rasterizeColumns(row).forEach((rasterizedRow, rIndex) => {
            let lineString = '';
            rasterizedRow.forEach((column, cIndex) => {
                const { width } = row[cIndex];
                const availableWidth = this.getEffectiveWidth(row[cIndex]);
                let tempString = column;

                if (availableWidth > mixin.stringWidth(column)) {
                    tempString += ' '.repeat(availableWidth - mixin.stringWidth(column));
                }

                if (row[cIndex].align && row[cIndex].align !== 'left' && this.wrap) {
                    const alignFn = alignmentMethods[row[cIndex].align];
                    tempString = alignFn(tempString, availableWidth);
                    if (mixin.stringWidth(tempString) < availableWidth) {
                        tempString += ' '.repeat((width || 0) - mixin.stringWidth(tempString) - 1);
                    }
                }

                const padding = row[cIndex].padding || [];
                if (padding[UI_PADDING.LEFT]) {
                    lineString += ' '.repeat(padding[UI_PADDING.LEFT]);
                }
                lineString += addBorders(row[cIndex], tempString, '| ');
                lineString += tempString;
                lineString += addBorders(row[cIndex], tempString, ' |');
                if (padding[UI_PADDING.RIGHT]) {
                    lineString += ' '.repeat(padding[UI_PADDING.RIGHT]);
                }

                if (rIndex === 0 && lines.length > 0) {
                    lineString = this.handleInlineRendering(lineString, lines[lines.length - 1]);
                }
            });

            lines.push({
                text: lineString.replace(/ +$/, ''),
                span: row.span
            });
        });
    }

    handleInlineRendering(currentLine, previousLine) {
        const leadingWhitespace = currentLine.match(/^ */)[0].length;
        const trimmedTarget = previousLine.text.trimRight();
        const targetTextLength = mixin.stringWidth(trimmedTarget);

        if (!previousLine.span) return currentLine;
        if (!this.wrap) {
            previousLine.hidden = true;
            return trimmedTarget + currentLine;
        }
        if (leadingWhitespace < targetTextLength) return currentLine;

        previousLine.hidden = true;
        return trimmedTarget + ' '.repeat(leadingWhitespace - targetTextLength) + currentLine.trimLeft();
    }

    rasterizeColumns(row) {
        const rasterizedRows = [];
        const calculatedWidths = this.determineColumnWidths(row);

        row.forEach((col, colIndex) => {
            col.width = calculatedWidths[colIndex];
            let wrappedLines;
            if (this.wrap) {
                wrappedLines = mixin.wrap(col.text, this.getEffectiveWidth(col), { hard: true }).split('\n');
            } else {
                wrappedLines = col.text.split('\n');
            }
            if (col.border) {
                wrappedLines.unshift('.' + '-'.repeat(this.getEffectiveWidth(col) + 2) + '.');
                wrappedLines.push("'" + '-'.repeat(this.getEffectiveWidth(col) + 2) + "'");
            }
            if (col.padding) {
                wrappedLines.unshift(...Array(col.padding[UI_PADDING.TOP] || 0).fill(''));
                wrappedLines.push(...Array(col.padding[UI_PADDING.BOTTOM] || 0).fill(''));
            }
            wrappedLines.forEach((line, rIndex) => {
                if (!rasterizedRows[rIndex]) {
                    rasterizedRows.push([]);
                }
                const rowContent = rasterizedRows[rIndex];
                for (let i = 0; i < colIndex; i++) {
                    if (rowContent[i] === undefined) {
                        rowContent.push('');
                    }
                }
                rowContent.push(line);
            });
        });

        return rasterizedRows;
    }

    getEffectiveWidth(col) {
        let contentWidth = col.width || 0;
        if (col.padding) {
            contentWidth -= (col.padding[UI_PADDING.LEFT] || 0) + (col.padding[UI_PADDING.RIGHT] || 0);
        }
        if (col.border) {
            contentWidth -= 4;
        }
        return contentWidth;
    }

    determineColumnWidths(row) {
        if (!this.wrap) {
            return row.map(col => col.width || mixin.stringWidth(col.text));
        }

        let unsetColumns = row.length;
        let totalWidthAvailable = this.width;
        const widths = row.map(col => {
            if (col.width) {
                unsetColumns--;
                totalWidthAvailable -= col.width;
                return col.width;
            }
            return undefined;
        });

        const widthForUnsetColumns = unsetColumns ? Math.floor(totalWidthAvailable / unsetColumns) : 0;
        return widths.map((width, i) => width !== undefined ? width : Math.max(widthForUnsetColumns, calculateMinWidth(row[i])));
    }
}

function addBorders(column, textContent, style) {
    if (column.border) {
        if (/[.']-+[.']/.test(textContent)) {
            return '';
        }
        if (textContent.trim().length !== 0) {
            return style;
        }
        return '  ';
    }
    return '';
}

function calculateMinWidth(column) {
    const padding = column.padding || [];
    const baseMinWidth = 1 + (padding[UI_PADDING.LEFT] || 0) + (padding[UI_PADDING.RIGHT] || 0);
    if (column.border) {
        return baseMinWidth + 4;
    }
    return baseMinWidth;
}

function captureWindowWidth() {
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
        return process.stdout.columns;
    }
    return 80;
}

function alignTextRight(text, width) {
    text = text.trim();
    const textWidth = mixin.stringWidth(text);
    if (textWidth < width) {
        return ' '.repeat(width - textWidth) + text;
    }
    return text;
}

function alignTextCenter(text, width) {
    text = text.trim();
    const textWidth = mixin.stringWidth(text);
    if (textWidth >= width) {
        return text;
    }
    return ' '.repeat((width - textWidth) >> 1) + text;
}

let mixin;
function createCLIUI(options, utilities) {
    mixin = utilities;
    return new UserInterface({
        width: options?.width || captureWindowWidth(),
        wrap: options?.wrap
    });
}

// Load external dependencies:
const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const wrap = require('wrap-ansi');

function userInterface(options) {
    return createCLIUI(options, {
        stringWidth,
        stripAnsi,
        wrap
    });
}

module.exports = userInterface;
