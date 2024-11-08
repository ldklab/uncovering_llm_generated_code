'use strict';

const align = { right: alignRight, center: alignCenter };
const [top, right, bottom, left] = [0, 1, 2, 3];

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
        if (args.length === 0) this.div('');
        if (this.wrap && this.shouldApplyLayoutDSL(...args) && typeof args[0] === 'string') {
            return this.applyLayoutDSL(args[0]);
        }
        const cols = args.map(arg => (typeof arg === 'string' ? this.colFromString(arg) : arg));
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
        return { text, padding: this.measurePadding(text) };
    }

    measurePadding(str) {
        const noAnsi = mixin.stripAnsi(str);
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
                const { width } = row[c];
                const wrapWidth = this.negatePadding(row[c]);
                let ts = col;

                if (wrapWidth > mixin.stringWidth(col)) {
                    ts += ' '.repeat(wrapWidth - mixin.stringWidth(col));
                }

                if (row[c].align && row[c].align !== 'left' && this.wrap) {
                    const fn = align[row[c].align];
                    ts = fn(ts, wrapWidth);
                    if (mixin.stringWidth(ts) < wrapWidth) {
                        ts += ' '.repeat((width || 0) - mixin.stringWidth(ts) - 1);
                    }
                }

                const padding = row[c].padding || [0, 0, 0, 0];
                if (padding[left]) {
                    str += ' '.repeat(padding[left]);
                }
                str += addBorder(row[c], ts, '| ');
                str += ts;
                str += addBorder(row[c], ts, ' |');
                if (padding[right]) {
                    str += ' '.repeat(padding[right]);
                }

                if (r === 0 && lines.length > 0) {
                    str = this.renderInline(str, lines[lines.length - 1]);
                }
            });

            lines.push({
                text: str.replace(/ +$/, ''),
                span: row.span
            });
        });

        return lines;
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
        const rrows = [];
        const widths = this.columnWidths(row);
        let wrapped;

        row.forEach((col, c) => {
            col.width = widths[c];
            if (this.wrap) {
                wrapped = mixin.wrap(col.text, this.negatePadding(col), { hard: true }).split('\n');
            } else {
                wrapped = col.text.split('\n');
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
                if (!rrows[r]) {
                    rrows.push([]);
                }
                const rrow = rrows[r];
                for (let i = 0; i < c; i++) {
                    if (rrow[i] === undefined) {
                        rrow.push('');
                    }
                }
                rrow.push(str);
            });
        });
        return rrows;
    }

    negatePadding(col) {
        let wrapWidth = col.width || 0;
        if (col.padding) {
            wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0);
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

        let unset = row.length;
        let remainingWidth = this.width;

        const widths = row.map(col => {
            if (col.width) {
                unset--;
                remainingWidth -= col.width;
                return col.width;
            }
            return undefined;
        });

        const unsetWidth = unset ? Math.floor(remainingWidth / unset) : 0;
        return widths.map((w, i) => (w === undefined ? Math.max(unsetWidth, _minWidth(row[i])) : w));
    }
}

function addBorder(col, ts, style) {
    if (col.border) {
        if (/[.']-+[.']/.test(ts)) return '';
        if (ts.trim().length !== 0) return style;
        return '  ';
    }
    return '';
}

function _minWidth(col) {
    const padding = col.padding || [];
    const minWidth = 1 + (padding[left] || 0) + (padding[right] || 0);
    return col.border ? minWidth + 4 : minWidth;
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
function cliui(opts, _mixin) {
    mixin = _mixin;
    return new UI({ width: opts?.width || getWindowWidth(), wrap: opts?.wrap });
}

const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const wrap = require('wrap-ansi');

function ui(opts) {
    return cliui(opts, { stringWidth, stripAnsi, wrap });
}

module.exports = ui;
