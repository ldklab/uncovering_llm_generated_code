'use strict';

const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const wrap = require('wrap-ansi');

function getAlignFunctions() {
    return {
        right: alignRight,
        center: alignCenter
    };
}

const PADDING = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3
};

class UI {
    constructor(opts) {
        this.width = opts.width;
        this.wrap = opts.wrap !== undefined ? opts.wrap : true;
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
        if (args.length === 0) {
            this.div('');
        }
        if (this.wrap && this.shouldApplyLayoutDSL(...args) && typeof args[0] === 'string') {
            return this.applyLayoutDSL(args[0]);
        }
        const cols = args.map(arg => typeof arg === 'string' ? this.colFromString(arg) : arg);
        this.rows.push(cols);
        return cols;
    }

    shouldApplyLayoutDSL(...args) {
        return args.length === 1 && typeof args[0] === 'string' && /[\t\n]/.test(args[0]);
    }

    applyLayoutDSL(str) {
        const rows = str.split('\n').map(row => row.split('\t'));
        let leftColumnWidth = 0;

        rows.forEach(columns => {
            if (columns.length > 1 && mixin.stringWidth(columns[0]) > leftColumnWidth) {
                leftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin.stringWidth(columns[0]));
            }
        });

        rows.forEach(columns => {
            this.div(...columns.map((r, i) => ({
                text: r.trim(),
                padding: this.measurePadding(r),
                width: (i === 0 && columns.length > 1) ? leftColumnWidth : undefined
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
        const noAnsi = mixin.stripAnsi(str);
        return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length];
    }

    toString() {
        const lines = [];
        this.rows.forEach(row => {
            this.rowToString(row, lines);
        });
        return lines.filter(line => !line.hidden).map(line => line.text).join('\n');
    }

    rowToString(row, lines) {
        this.rasterize(row).forEach((rrow, r) => {
            let output = '';

            rrow.forEach((col, c) => {
                const { width } = row[c];
                const wrapWidth = this.negatePadding(row[c]);
                let tempString = col;

                if (wrapWidth > mixin.stringWidth(col)) {
                    tempString += ' '.repeat(wrapWidth - mixin.stringWidth(col));
                }

                if (row[c].align && row[c].align !== 'left' && this.wrap) {
                    const alignFunction = align[row[c].align];
                    tempString = alignFunction(tempString, wrapWidth);

                    if (mixin.stringWidth(tempString) < wrapWidth) {
                        tempString += ' '.repeat((width || 0) - mixin.stringWidth(tempString) - 1);
                    }
                }

                const padding = row[c].padding || [0, 0, 0, 0];
                if (padding[PADDING.left]) {
                    output += ' '.repeat(padding[PADDING.left]);
                }
                output += this.addBorder(row[c], tempString, '| ') + tempString + this.addBorder(row[c], tempString, ' |');
                if (padding[PADDING.right]) {
                    output += ' '.repeat(padding[PADDING.right]);
                }

                if (r === 0 && lines.length > 0) {
                    output = this.renderInline(output, lines[lines.length - 1]);
                }
            });

            lines.push({
                text: output.replace(/ +$/, ''),
                span: row.span
            });
        });
    }

    renderInline(source, previousLine) {
        const match = source.match(/^ */);
        const leadingWhitespace = match ? match[0].length : 0;
        const target = previousLine.text;
        const targetTextWidth = mixin.stringWidth(target.trimRight());

        if (!previousLine.span) {
            return source;
        }

        if (!this.wrap) {
            previousLine.hidden = true;
            return target + source;
        }

        if (leadingWhitespace < targetTextWidth) {
            return source;
        }

        previousLine.hidden = true;
        return target.trimRight() + ' '.repeat(leadingWhitespace - targetTextWidth) + source.trimLeft();
    }

    rasterize(row) {
        const resultRows = [];
        const columnWidths = this.columnWidths(row);

        row.forEach((col, c) => {
            col.width = columnWidths[c];
            const wrapped = this.wrap ? mixin.wrap(col.text, this.negatePadding(col), { hard: true }).split('\n') : col.text.split('\n');

            if (col.border) {
                wrapped.unshift('.' + '-'.repeat(this.negatePadding(col) + 2) + '.');
                wrapped.push("'" + '-'.repeat(this.negatePadding(col) + 2) + "'");
            }

            if (col.padding) {
                wrapped.unshift(...new Array(col.padding[PADDING.top] || 0).fill(''));
                wrapped.push(...new Array(col.padding[PADDING.bottom] || 0).fill(''));
            }

            wrapped.forEach((str, r) => {
                if (!resultRows[r]) {
                    resultRows.push([]);
                }
                const resultRow = resultRows[r];
                for (let i = 0; i < c; i++) {
                    if (resultRow[i] === undefined) {
                        resultRow.push('');
                    }
                }
                resultRow.push(str);
            });
        });
        return resultRows;
    }

    negatePadding(col) {
        let wrapWidth = col.width || 0;
        if (col.padding) {
            wrapWidth -= (col.padding[PADDING.left] || 0) + (col.padding[PADDING.right] || 0);
        }
        if (col.border) {
            wrapWidth -= 4;
        }
        return wrapWidth;
    }

    columnWidths(row) {
        if (!this.wrap) {
            return row.map(col => col.width || mixin.stringWidth(col.text));
        }

        let unsetCount = row.length;
        let availableWidth = this.width;

        const widths = row.map(col => {
            if (col.width) {
                unsetCount--;
                availableWidth -= col.width;
                return col.width;
            }
            return undefined;
        });

        const unsetWidth = unsetCount ? Math.floor(availableWidth / unsetCount) : 0;
        return widths.map((w, i) => w === undefined ? Math.max(unsetWidth, this.getMinimumWidth(row[i])) : w);
    }

    getMinimumWidth(col) {
        const padding = col.padding || [];
        const baseMinWidth = 1 + (padding[PADDING.left] || 0) + (padding[PADDING.right] || 0);
        return col.border ? baseMinWidth + 4 : baseMinWidth;
    }

    addBorder(col, text, style) {
        if (col.border) {
            if (/[.']-+[.']/.test(text)) {
                return '';
            }
            return text.trim().length !== 0 ? style : '  ';
        }
        return '';
    }
}

function getWindowWidth() {
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
        return process.stdout.columns;
    }
    return 80;
}

function alignRight(str, width) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    return strWidth < width ? ' '.repeat(width - strWidth) + str : str;
}

function alignCenter(str, width) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    return strWidth >= width ? str : ' '.repeat((width - strWidth) >> 1) + str;
}

let mixin;
function cliui(opts, injectedMixin) {
    mixin = injectedMixin;
    return new UI({
        width: opts?.width || getWindowWidth(),
        wrap: opts?.wrap
    });
}

function ui(opts) {
    return cliui(opts, {
        stringWidth,
        stripAnsi,
        wrap
    });
}

module.exports = ui;
