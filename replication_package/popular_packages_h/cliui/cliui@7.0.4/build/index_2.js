'use strict';

const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const wrap = require('wrap-ansi');

class UI {
    constructor({ width, wrap = true }) {
        this.width = width;
        this.wrap = wrap;
        this.rows = [];
    }

    span(...args) {
        const cols = this.div(...args);
        cols.span = true;
    }

    resetOutput() {
        this.rows = [];
    }

    div(...args) {
        if (args.length === 0) args = [''];

        if (this.wrap && this.shouldApplyLayoutDSL(args) && typeof args[0] === 'string') {
            return this.applyLayoutDSL(args[0]);
        }

        const cols = args.map(arg => typeof arg === 'string' ? this.colFromString(arg) : arg);
        this.rows.push(cols);
        return cols;
    }

    shouldApplyLayoutDSL([arg]) {
        return typeof arg === 'string' && /[\t\n]/.test(arg);
    }

    applyLayoutDSL(str) {
        const rows = str.split('\n').map(row => row.split('\t'));
        let leftColumnWidth = Math.min(...rows.flatMap(columns => 
            columns.length > 1 ? stringWidth(columns[0]) : 0));

        rows.forEach(columns => {
            this.div(...columns.map((text, i) => ({
                text: text.trim(),
                padding: this.measurePadding(text),
                width: i === 0 && columns.length > 1 ? leftColumnWidth : undefined
            })));
        });

        return this.rows[this.rows.length - 1];
    }

    colFromString(text) {
        return {
            text,
            padding: this.measurePadding(text)
        };
    }

    measurePadding(str) {
        const noAnsi = stripAnsi(str);
        return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length];
    }

    toString() {
        const lines = [];
        this.rows.forEach(row => this.rowToString(row, lines));
        return lines.filter(line => !line.hidden).map(line => line.text).join('\n');
    }

    rowToString(row, lines) {
        this.rasterize(row).forEach((rrow, r) => {
            let str = '';

            rrow.forEach((col, c) => {
                const columnDetails = row[c];
                const wrapWidth = this.negatePadding(columnDetails);
                
                if (columnDetails.align && columnDetails.align !== 'left' && this.wrap) {
                    col = align[columnDetails.align](col, wrapWidth);
                }

                str += ' '.repeat(columnDetails.padding[left] || 0);
                str += addBorder(columnDetails, col, '| ');
                str += col;
                str += addBorder(columnDetails, col, ' |');
                str += ' '.repeat(columnDetails.padding[right] || 0);

                if (r === 0 && lines.length > 0) {
                    str = this.renderInline(str, lines[lines.length - 1]);
                }
            });

            lines.push({ text: str.trimRight(), span: row.span });
        });

        return lines;
    }

    renderInline(source, previousLine) {
        if (!previousLine.span) return source;

        const match = source.match(/^ */);
        const leadingWhitespace = match ? match[0].length : 0;

        if (leadingWhitespace >= stringWidth(previousLine.text.trimRight())) {
            previousLine.hidden = true;
            return previousLine.text.trimRight() + ' '.repeat(leadingWhitespace) + source.trimLeft();
        }

        return source;
    }

    rasterize(row) {
        const rrows = [];
        const widths = this.columnWidths(row);

        row.forEach((col, c) => {
            col.width = widths[c];
            let wrapped = col.text.split('\n');

            if (this.wrap) {
                wrapped = wrap(col.text, this.negatePadding(col), { hard: true }).split('\n');
            }

            if (col.border) {
                wrapped.unshift('.' + '-'.repeat(this.negatePadding(col) + 2) + '.');
                wrapped.push("'" + '-'.repeat(this.negatePadding(col) + 2) + "'");
            }

            if (col.padding) {
                wrapped.unshift(...new Array(col.padding[top] || 0).fill(''));
                wrapped.push(...new Array(col.padding[bottom] || 0).fill(''));
            }

            wrapped.forEach((str, r) => {
                if (!rrows[r]) rrows.push([]);
                rrows[r][c] = str;
            });
        });

        return rrows;
    }

    negatePadding({ width = 0, padding = [0, 0, 0, 0], border }) {
        return width - (padding[left] + padding[right] + (border ? 4 : 0));
    }

    columnWidths(row) {
        if (!this.wrap) {
            return row.map(({ width, text }) => width || stringWidth(text));
        }

        let remainingWidth = this.width;
        const widths = row.map(({ width }) => {
            if (width) {
                remainingWidth -= width;
                return width;
            }
            return undefined;
        });

        const unsetWidth = Math.floor(remainingWidth / row.filter(w => w === undefined).length);
        return widths.map((width, i) => width !== undefined ? width : Math.max(unsetWidth, _minWidth(row[i])));
    }
}

function alignRight(str, width) {
    str = str.trim();
    const strWidth = stringWidth(str);
    return strWidth < width ? ' '.repeat(width - strWidth) + str : str;
}

function alignCenter(str, width) {
    str = str.trim();
    const strWidth = stringWidth(str);
    return strWidth < width ? ' '.repeat((width - strWidth) >> 1) + str : str;
}

function addBorder({ border }, ts, style) {
    if (border && !/[.']-+[.']/.test(ts) && ts.trim()) {
        return style;
    }
    return '';
}

function _minWidth({ padding = [], border }) {
    const minWidth = 1 + (padding[left] || 0) + (padding[right] || 0);
    return border ? minWidth + 4 : minWidth;
}

function getWindowWidth() {
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
        return process.stdout.columns;
    }
    return 80;
}

const align = { right: alignRight, center: alignCenter };
const [top, right, bottom, left] = [0, 1, 2, 3];

function cliui(opts) {
    const mixed = { stringWidth, stripAnsi, wrap };
    return new UI({
        width: opts?.width || getWindowWidth(),
        wrap: opts?.wrap
    });
}

module.exports = cliui;
