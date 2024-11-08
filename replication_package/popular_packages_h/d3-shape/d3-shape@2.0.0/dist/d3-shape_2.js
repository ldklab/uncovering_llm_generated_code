// Create a self-executing function to define the module
(function (global, factory) {
    // Set up your factory based on the environment (CommonJS, AMD, or browser global)
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-path')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3-path'], factory) :
    (global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
}(this, function (exports, d3Path) { 'use strict';

    // Define helper functions
    const constant = x => () => x;

    const abs = Math.abs, atan2 = Math.atan2, cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt;
    const max = Math.max, min = Math.min;
    const pi = Math.PI, tau = 2 * pi, halfPi = pi / 2, epsilon = 1e-12;

    const acos = x => x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    const asin = x => x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);

    // Define line and curve functionalities
    function line(xFn = x, yFn = y) {
        var defined = constant(true),
            context = null,
            curve = curveLinear,
            output = null;

        xFn = typeof xFn === "function" ? xFn : (xFn === undefined) ? x : constant(xFn);
        yFn = typeof yFn === "function" ? yFn : (yFn === undefined) ? y : constant(yFn);

        function line(data) {
            var buffer,
                defined0 = false;

            if (context == null) output = curve(buffer = d3Path.path());

            for (let i = 0, n = (data = array(data)).length; i <= n; ++i) {
                let d, definedCheck;
                definedCheck = !(i < n && defined(d = data[i], i, data)) === defined0;
                if (definedCheck) {
                    if (defined0 = !defined0) output.lineStart();
                    else output.lineEnd();
                }
                if (defined0) output.point(+xFn(d, i, data), +yFn(d, i, data));
            }

            if (buffer) return output = null, buffer + "" || null;
        }

        line.x = function (_) {
            return arguments.length ? (xFn = typeof _ === "function" ? _ : constant(+_), line) : xFn;
        };

        line.y = function (_) {
            return arguments.length ? (yFn = typeof _ === "function" ? _ : constant(+_), line) : yFn;
        };

        line.defined = function (_) {
            return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), line) : defined;
        };

        line.curve = function (_) {
            return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
        };

        line.context = function (_) {
            return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
        };

        return line;
    }

    // Define area graph functionality
    function area(x0Accessor = x, y0Accessor = constant(0), y1Accessor = y) {
        var x1Accessor = null,
            defined = constant(true),
            curve = curveLinear,
            output = null;

        x0Accessor = typeof x0Accessor === "function" ? x0Accessor : (x0Accessor === undefined) ? x : constant(x0Accessor);
        y0Accessor = typeof y0Accessor === "function" ? y0Accessor : (y0Accessor === undefined) ? constant(0) : constant(y0Accessor);
        y1Accessor = typeof y1Accessor === "function" ? y1Accessor : (y1Accessor === undefined) ? y : constant(y1Accessor);

        function area(data) {
            var buffer,
                defined0 = false,
                x0z = new Array(n = (data = array(data)).length),
                y0z = new Array(n),
                lineGen = line().defined(defined).curve(curve).context(context),
                context = null;

            if (!context) output = curve(buffer = d3Path.path());
            for (let i = 0, j = 0; i <= n; ++i) {
                let d, definedCheck = !(i < n && defined(d = data[i], i, data)) === defined0;
                if (definedCheck) {
                    if (defined0 = !defined0) {
                        j = i;
                        output.areaStart();
                        output.lineStart();
                    } else {
                        output.lineEnd();
                        output.lineStart();
                        for (let k = i - 1; k >= j; --k) {
                            output.point(x0z[k], y0z[k]);
                        }
                        output.lineEnd();
                        output.areaEnd();
                    }
                }
                if (defined0) {
                    x0z[i] = +x0Accessor(d, i, data), y0z[i] = +y0Accessor(d, i, data);
                    output.point(x1Accessor ? +x1Accessor(d, i, data) : x0z[i], y1Accessor ? +y1Accessor(d, i, data) : y0z[i]);
                }
            }
            if (buffer) return output = null, buffer + "" || null;
        }

        area.x = function (_) {
            return arguments.length ? (x0Accessor = typeof _ === "function" ? _ : constant(+_), x1Accessor = null, area) : x0Accessor;
        };

        area.y0 = function (_) {
            return arguments.length ? (y0Accessor = typeof _ === "function" ? _ : constant(+_), area) : y0Accessor;
        };

        area.y1 = function (_) {
            return arguments.length ? (y1Accessor = _ == null ? null : typeof _ === "function" ? _ : constant(+_), area) : y1Accessor;
        };

        area.defined = function (_) {
            return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), area) : defined;
        };

        area.curve = function (_) {
            return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
        };

        area.context = function (_) {
            return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
        };

        return area;
    }

    // Define pie chart functionality
    function pie() {
        var value = identity,
            sortValues = descending,
            sort = null,
            startAngle = constant(0),
            endAngle = constant(tau),
            padAngle = constant(0);

        function pie(data) {
            var arcs = new Array(n = (data = array(data)).length),
                sum = 0, j, i, v, index = new Array(n),
                a0 = +startAngle.apply(this, arguments),
                da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0));

            for (i = 0; i < n; ++i) {
                if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
                    sum += v;
                }
            }

            if (sortValues != null) index.sort(function (i, j) { return sortValues(arcs[i], arcs[j]); });
            else if (sort != null) index.sort(function (i, j) { return sort(data[i], data[j]); });

            for (i = 0, j = 0, k = sum ? (da - n * padAngle.apply(this, arguments)) / sum : 0; i < n; ++i) {
                j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa;
                arcs[j] = { data: data[j], index: i, value: v, startAngle: a0, endAngle: a1, padAngle: p };
            }
            return arcs;
        }

        pie.value = function (_) {
            return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), pie) : value;
        };

        pie.sortValues = function (_) {
            return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
        };

        pie.sort = function (_) {
            return arguments.length ? (sort = _, sortValues = null, pie) : sort;
        };

        pie.startAngle = function (_) {
            return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), pie) : startAngle;
        };

        pie.endAngle = function (_) {
            return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), pie) : endAngle;
        };

        pie.padAngle = function (_) {
            return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), pie) : padAngle;
        };

        return pie;
    }

    // Define symbol generation functionality
    function symbol(type, size) {
        var context = null;
        type = typeof type === "function" ? type : constant(type || circle);
        size = typeof size === "function" ? size : constant(size === undefined ? 64 : +size);

        function symbol() {
            var buffer;
            if (!context) context = buffer = d3Path.path();
            type.apply(this, arguments).draw(context, +size.apply(this, arguments));
            if (buffer) return context = null, buffer + "" || null;
        }

        symbol.type = function (_) {
            return arguments.length ? (type = typeof _ === "function" ? _ : constant(_), symbol) : type;
        };

        symbol.size = function (_) {
            return arguments.length ? (size = typeof _ === "function" ? _ : constant(+_), symbol) : size;
        };

        symbol.context = function (_) {
            return arguments.length ? (context = _ == null ? null : _, symbol) : context;
        };

        return symbol;
    }

    // Export functions for external usage
    exports.arc = arc;
    exports.area = area;
    exports.areaRadial = areaRadial;
    exports.curveBasis = basis;
    exports.curveBasisClosed = basisClosed;
    exports.curveBasisOpen = basisOpen;
    exports.curveBundle = bundle;
    exports.curveCardinal = cardinal;
    exports.curveCardinalClosed = cardinalClosed;
    exports.curveCardinalOpen = cardinalOpen;
    exports.curveCatmullRom = catmullRom;
    exports.curveCatmullRomClosed = catmullRomClosed;
    exports.curveCatmullRomOpen = catmullRomOpen;
    exports.curveLinear = curveLinear;
    exports.curveLinearClosed = linearClosed;
    exports.curveMonotoneX = monotoneX;
    exports.curveMonotoneY = monotoneY;
    exports.curveNatural = natural;
    exports.curveStep = step;
    exports.curveStepAfter = stepAfter;
    exports.curveStepBefore = stepBefore;
    exports.line = line;
    exports.lineRadial = lineRadial$1;
    exports.linkHorizontal = linkHorizontal;
    exports.linkRadial = linkRadial;
    exports.linkVertical = linkVertical;
    exports.pie = pie;
    exports.pointRadial = pointRadial;
    exports.radialArea = areaRadial;
    exports.radialLine = lineRadial$1;
    exports.stack = stack;
    exports.stackOffsetDiverging = diverging;
    exports.stackOffsetExpand = expand;
    exports.stackOffsetNone = none;
    exports.stackOffsetSilhouette = silhouette;
    exports.stackOffsetWiggle = wiggle;
    exports.stackOrderAppearance = appearance;
    exports.stackOrderAscending = ascending;
    exports.stackOrderDescending = descending$1;
    exports.stackOrderInsideOut = insideOut;
    exports.stackOrderNone = none$1;
    exports.stackOrderReverse = reverse;
    exports.symbol = symbol;
    exports.symbolCircle = circle;
    exports.symbolCross = cross;
    exports.symbolDiamond = diamond;
    exports.symbolSquare = square;
    exports.symbolStar = star;
    exports.symbolTriangle = triangle;
    exports.symbolWye = wye;
    exports.symbols = symbols;

}));  // End of factory function
