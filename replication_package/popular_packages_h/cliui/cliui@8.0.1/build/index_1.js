'use strict';

const alignments = {
    right: alignToRight,
    center: alignToCenter
};

const PADDING_TOP = 0;
const PADDING_RIGHT = 1;
const PADDING_BOTTOM = 2;
const PADDING_LEFT = 3;

class UserInterface {
    constructor(options) {
        const { width, wrap = true } = options;
        this.width = width;
        this.wrap = wrap;
        this.rows = [];
    }

    addSpan(...args) {
        const columns = this.addColumn(...args);
        columns.span = true;
    }

    clearOutput() {
        this.rows = [];
    }

    addColumn(...args) {
        if (args.length === 0) {
            this.addColumn('');
        }
        if (this.wrap && this.isLayoutDSL(...args) && typeof args[0] === 'string') {
            return this.processLayoutDSL(args[0]);
        }
        const columns = args.map(arg => typeof arg === 'string' ? this.createColumnFromString(arg) : arg);
        this.rows.push(columns);
        return columns;
    }

    isLayoutDSL(...args) {
        return args.length === 1 && typeof args[0] === 'string' && /[\t\n]/.test(args[0]);
    }

    processLayoutDSL(string) {
        const rows = string.split('\n').map(row => row.split('\t'));
        let maxLeftColumnWidth = 0;

        rows.forEach(columns => {
            if (columns.length > 1 && mixin.stringWidth(columns[0]) > maxLeftColumnWidth) {
                maxLeftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin.stringWidth(columns[0]));
            }
        });

        rows.forEach(columns => {
            this.addColumn(...columns.map((text, index) => ({
                text: text.trim(),
                padding: this.calculatePadding(text),
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

    calculatePadding(string) {
        const strippedString = mixin.stripAnsi(string);
        return [0, strippedString.match(/\s*$/)[0].length, 0, strippedString.match(/^\s*/)[0].length];
    }

    renderString() {
        const lines = [];
        this.rows.forEach(row => this.convertRowToString(row, lines));
        return lines.filter(line => !line.hidden).map(line => line.text).join('\n');
    }

    convertRowToString(row, lines) {
        this.processRows(row).forEach(processedRow => {
            let lineString = '';
            processedRow.forEach((column, index) => {
                let { width } = row[index];
                const contentWidth = this.adjustContentWidth(row[index]);
                let formattedColumn = column;

                if (contentWidth > mixin.stringWidth(column)) {
                    formattedColumn += ' '.repeat(contentWidth - mixin.stringWidth(column));
                }

                if (row[index].align && row[index].align !== 'left' && this.wrap) {
                    formattedColumn = alignments[row[index].align](formattedColumn, contentWidth);
                    if (mixin.stringWidth(formattedColumn) < contentWidth) {
                        formattedColumn += ' '.repeat((width || 0) - mixin.stringWidth(formattedColumn) - 1);
                    }
                }

                const padding = row[index].padding || [0, 0, 0, 0];
                if (padding[PADDING_LEFT]) {
                    lineString += ' '.repeat(padding[PADDING_LEFT]);
                }
                lineString += applyBorder(row[index], formattedColumn, '| ');
                lineString += formattedColumn;
                lineString += applyBorder(row[index], formattedColumn, ' |');
                if (padding[PADDING_RIGHT]) {
                    lineString += ' '.repeat(padding[PADDING_RIGHT]);
                }

                if (processedRow[0] === 0 && lines.length > 0) {
                    lineString = this.inlineRender(lineString, lines[lines.length - 1]);
                }
            });

            lines.push({
                text: lineString.replace(/ +$/, ''),
                span: row.span
            });
        });

        return lines;
    }

    inlineRender(source, previousLine) {
        const leadingWhitespace = source.match(/^ */)[0].length;
        const targetTextWidth = mixin.stringWidth(previousLine.text.trimRight());

        if (!previousLine.span) {
            return source;
        }

        if (!this.wrap) {
            previousLine.hidden = true;
            return previousLine.text + source;
        }

        if (leadingWhitespace < targetTextWidth) {
            return source;
        }

        previousLine.hidden = true;
        return previousLine.text.trimRight() + ' '.repeat(leadingWhitespace - targetTextWidth) + source.trimLeft();
    }

    processRows(row) {
        const processedRows = [];
        const columnWidths = this.calculateColumnWidths(row);
        let wrappedText;

        row.forEach((column, index) => {
            column.width = columnWidths[index];

            if (this.wrap) {
                wrappedText = mixin.wrap(column.text, this.adjustContentWidth(column), { hard: true }).split('\n');
            } else {
                wrappedText = column.text.split('\n');
            }

            if (column.border) {
                wrappedText.unshift('.' + '-'.repeat(this.adjustContentWidth(column) + 2) + '.');
                wrappedText.push("'" + '-'.repeat(this.adjustContentWidth(column) + 2) + "'");
            }

            if (column.padding) {
                wrappedText.unshift(...new Array(column.padding[PADDING_TOP] || 0).fill(''));
                wrappedText.push(...new Array(column.padding[PADDING_BOTTOM] || 0).fill(''));
            }

            wrappedText.forEach((string, rowIndex) => {
                if (!processedRows[rowIndex]) {
                    processedRows.push([]);
                }
                const processedRow = processedRows[rowIndex];

                for (let i = 0; i < index; i++) {
                    if (processedRow[i] === undefined) {
                        processedRow.push('');
                    }
                }
                processedRow.push(string);
            });
        });

        return processedRows;
    }

    adjustContentWidth(column) {
        let width = column.width || 0;
        if (column.padding) {
            width -= (column.padding[PADDING_LEFT] || 0) + (column.padding[PADDING_RIGHT] || 0);
        }
        if (column.border) {
            width -= 4;
        }
        return width;
    }

    calculateColumnWidths(row) {
        if (!this.wrap) {
            return row.map(column => column.width || mixin.stringWidth(column.text));
        }

        let unsetColumns = row.length;
        let remainingWidth = this.width;

        const predefinedWidths = row.map(column => {
            if (column.width) {
                unsetColumns--;
                remainingWidth -= column.width;
                return column.width;
            }
            return undefined;
        });

        const calculatedWidth = unsetColumns ? Math.floor(remainingWidth / unsetColumns) : 0;
        return predefinedWidths.map((width, index) => width !== undefined ? width : Math.max(calculatedWidth, getMinimumWidth(row[index])));
    }
}

function applyBorder(column, text, style) {
    if (column.border) {
        if (/[.']-+[.']/.test(text)) {
            return '';
        }
        if (text.trim().length !== 0) {
            return style;
        }
        return '  ';
    }
    return '';
}

function getMinimumWidth(column) {
    const padding = column.padding || [];
    const minWidth = 1 + (padding[PADDING_LEFT] || 0) + (padding[PADDING_RIGHT] || 0);
    if (column.border) {
        return minWidth + 4;
    }
    return minWidth;
}

function determineWindowWidth() {
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
        return process.stdout.columns;
    }
    return 80;
}

function alignToRight(string, width) {
    string = string.trim();
    const stringLength = mixin.stringWidth(string);
    if (stringLength < width) {
        return ' '.repeat(width - stringLength) + string;
    }
    return string;
}

function alignToCenter(string, width) {
    string = string.trim();
    const stringLength = mixin.stringWidth(string);
    if (stringLength >= width) {
        return string;
    }
    return ' '.repeat((width - stringLength) >> 1) + string;
}

let mixin;
function initializeCLIUI(options, dependencies) {
    mixin = dependencies;
    return new UserInterface({
        width: options.width || determineWindowWidth(),
        wrap: options.wrap
    });
}

const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const wrapAnsi = require('wrap-ansi');

function createUIInstance(options) {
    return initializeCLIUI(options, {
        stringWidth,
        stripAnsi,
        wrap: wrapAnsi
    });
}

module.exports = createUIInstance;
