// Module for generating various geometric shapes and curves using D3.js

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports, require('d3-path'));
  } else if (typeof define === 'function' && define.amd) {
    define(['exports', 'd3-path'], factory);
  } else {
    global = global || self;
    factory(global.d3 = global.d3 || {}, global.d3);
  }
}(this, function (exports, d3Path) { 'use strict';

  const math = {
    abs: Math.abs,
    atan2: Math.atan2,
    cos: Math.cos,
    max: Math.max,
    min: Math.min,
    sin: Math.sin,
    sqrt: Math.sqrt,
    acos: function (x) { return x > 1 ? 0 : x < -1 ? Math.PI : Math.acos(x); },
    asin: function (x) { return x >= 1 ? Math.PI / 2 : x <= -1 ? -Math.PI / 2 : Math.asin(x); }
  };

  const constants = {
    epsilon: 1e-12,
    pi: Math.PI,
    halfPi: Math.PI / 2,
    tau: 2 * Math.PI
  };

  function constant(x) {
    return () => x;
  }

  function arc() {
    var innerRadius = arcInnerRadius,
        outerRadius = arcOuterRadius,
        cornerRadius = constant(0),
        padRadius = null,
        startAngle = arcStartAngle,
        endAngle = arcEndAngle,
        padAngle = arcPadAngle,
        context = null;

    function arc() {
      var buffer,
          r,
          r0 = +innerRadius.apply(this, arguments),
          r1 = +outerRadius.apply(this, arguments),
          a0 = startAngle.apply(this, arguments) - constants.halfPi,
          a1 = endAngle.apply(this, arguments) - constants.halfPi,
          da = math.abs(a1 - a0),
          cw = a1 > a0;

      if (!context) context = buffer = d3Path.path();

      if (r1 < r0) r = r1, r1 = r0, r0 = r;
      if (!(r1 > constants.epsilon)) context.moveTo(0, 0);
      else if (da > constants.tau - constants.epsilon) {
        context.moveTo(r1 * math.cos(a0), r1 * math.sin(a0));
        context.arc(0, 0, r1, a0, a1, !cw);
        if (r0 > constants.epsilon) {
          context.moveTo(r0 * math.cos(a1), r0 * math.sin(a1));
          context.arc(0, 0, r0, a1, a0, cw);
        }
      }
      else {
        var da0 = da,
            da1 = da,
            ap = padAngle.apply(this, arguments) / 2,
            rp = (ap > constants.epsilon) && (padRadius ? +padRadius.apply(this, arguments) : math.sqrt(r0 * r0 + r1 * r1)),
            rc = math.min(math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
            rc0 = rc,
            rc1 = rc,
            t0, t1;

        if (rp > constants.epsilon) {
          var p0 = math.asin(rp / r0 * math.sin(ap)),
              p1 = math.asin(rp / r1 * math.sin(ap));
          if ((da0 -= p0 * 2) > constants.epsilon) p0 *= (cw ? 1 : -1), a0 += p0, a1 -= p0;
          else da0 = 0, a0 = a1 = (a0 + a1) / 2;
          if ((da1 -= p1 * 2) > constants.epsilon) p1 *= (cw ? 1 : -1), a0 += p1, a1 -= p1;
          else da1 = 0, a0 = a1 = (a0 + a1) / 2;
        }

        var x01 = r1 * math.cos(a0),
            y01 = r1 * math.sin(a0),
            x10 = r0 * math.cos(a1),
            y10 = r0 * math.sin(a1);

        if (rc > constants.epsilon) {
          var oc;
          if (da < Math.PI && (oc = intersect(x01, y01, x10, y10, r0, r1))) {
            var ax = x01 - oc[0],
                ay = y01 - oc[1],
                bx = x10 - oc[0],
                by = y10 - oc[1],
                kc = 1 / math.sin(math.acos((ax * bx + ay * by) / (math.sqrt(ax * ax + ay * ay) * math.sqrt(bx * bx + by * by))) / 2),
                lc = math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
            rc0 = math.min(rc, (r0 - lc) / (kc - 1));
            rc1 = math.min(rc, (r1 - lc) / (kc + 1));
          }
        }

        if (!(da1 > constants.epsilon)) context.moveTo(x01, y01);
        else if (rc1 > constants.epsilon) {
          t0 = cornerTangents(x10, y10, x01, y01, r1, rc1, cw);
          t1 = cornerTangents(x01, y01, x10, y10, r1, rc1, cw);

          context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

          if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, math.atan2(t0.y01, t0.x01), math.atan2(t1.y01, t1.x01), !cw);
          else {
            context.arc(t0.cx, t0.cy, rc1, math.atan2(t0.y01, t0.x01), math.atan2(t0.y11, t0.x11), !cw);
            context.arc(0, 0, r1, math.atan2(t0.cy + t0.y11, t0.cx + t0.x11), math.atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
            context.arc(t1.cx, t1.cy, rc1, math.atan2(t1.y11, t1.x11), math.atan2(t1.y01, t1.x01), !cw);
          }
        }
        else context.moveTo(x01, y01), context.arc(0, 0, r1, a0, a1, !cw);

        if (!(r0 > constants.epsilon) || !(da0 > constants.epsilon)) context.lineTo(x10, y10);
        else if (rc0 > constants.epsilon) {
          t0 = cornerTangents(x10, y10, x01, y01, r0, -rc0, cw);
          t1 = cornerTangents(x01, y01, x10, y10, r0, -rc0, cw);

          context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

          if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, math.atan2(t0.y01, t0.x01), math.atan2(t1.y01, t1.x01), !cw);
          else {
            context.arc(t0.cx, t0.cy, rc0, math.atan2(t0.y01, t0.x01), math.atan2(t0.y11, t0.x11), !cw);
            context.arc(0, 0, r0, math.atan2(t0.cy + t0.y11, t0.cx + t0.x11), math.atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
            context.arc(t1.cx, t1.cy, rc0, math.atan2(t1.y11, t1.x11), math.atan2(t1.y01, t1.x01), !cw);
          }
        }
        else context.arc(0, 0, r0, a1, a0, cw);
      }

      context.closePath();

      if (buffer) return context = null, buffer + "" || null;
    }

    arc.centroid = function() {
      var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
          a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - constants.pi / 2;
      return [math.cos(a) * r, math.sin(a) * r];
    };

    arc.innerRadius = function(_) {
      return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant(+_), arc) : innerRadius;
    };

    arc.outerRadius = function(_) {
      return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant(+_), arc) : outerRadius;
    };

    arc.cornerRadius = function(_) {
      return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant(+_), arc) : cornerRadius;
    };

    arc.padRadius = function(_) {
      return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant(+_), arc) : padRadius;
    };

    arc.startAngle = function(_) {
      return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), arc) : startAngle;
    };

    arc.endAngle = function(_) {
      return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), arc) : endAngle;
    };

    arc.padAngle = function(_) {
      return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), arc) : padAngle;
    };

    arc.context = function(_) {
      return arguments.length ? ((context = _ == null ? null : _), arc) : context;
    };

    return arc;
  }

  function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
    var x10 = x1 - x0, y10 = y1 - y0,
        x32 = x3 - x2, y32 = y3 - y2,
        t = y32 * x10 - x32 * y10;
    if (t * t < constants.epsilon) return;
    t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
    return [x0 + t * x10, y0 + t * y10];
  }

  function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
    var x01 = x0 - x1,
        y01 = y0 - y1,
        lo = (cw ? rc : -rc) / math.sqrt(x01 * x01 + y01 * y01),
        ox = lo * y01,
        oy = -lo * x01,
        x11 = x0 + ox,
        y11 = y0 + oy,
        x10 = x1 + ox,
        y10 = y1 + oy,
        x00 = (x11 + x10) / 2,
        y00 = (y11 + y10) / 2,
        dx = x10 - x11,
        dy = y10 - y11,
        d2 = dx * dx + dy * dy,
        r = r1 - rc,
        D = x11 * y10 - x10 * y11,
        d = (dy < 0 ? -1 : 1) * math.sqrt(math.max(0, r * r * d2 - D * D)),
        cx0 = (D * dy - dx * d) / d2,
        cy0 = (-D * dx - dy * d) / d2,
        cx1 = (D * dy + dx * d) / d2,
        cy1 = (-D * dx + dy * d) / d2,
        dx0 = cx0 - x00,
        dy0 = cy0 - y00,
        dx1 = cx1 - x00,
        dy1 = cy1 - y00;

    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

    return {
      cx: cx0,
      cy: cy0,
      x01: -ox,
      y01: -oy,
      x11: cx0 * (r1 / r - 1),
      y11: cy0 * (r1 / r - 1)
    };
  }

  // Other shapes and curves implementation...

  function line(x, y) {
    var defined = constant(true),
        context = null,
        curve = curveLinear,
        output = null;

    x = typeof x === "function" ? x : (x === undefined) ? xFunc : constant(x);
    y = typeof y === "function" ? y : (y === undefined) ? yFunc : constant(y);

    function line(data) {
      var i, n = (data = array(data)).length, d, defined0 = false, buffer;

      if (context == null) output = curve(buffer = d3Path.path());

      for (i = 0; i <= n; ++i) {
        if (!(i < n && defined(d = data[i], i, data)) === defined0) {
          if (defined0 = !defined0) output.lineStart();
          else output.lineEnd();
        }
        if (defined0) output.point(+x(d, i, data), +y(d, i, data));
      }

      if (buffer) return output = null, buffer + "" || null;
    }

    line.x = function(_) {
      return arguments.length ? (x = typeof _ === "function" ? _ : constant(+_), line) : x;
    };

    line.y = function(_) {
      return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), line) : y;
    };

    line.defined = function(_) {
      return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), line) : defined;
    };

    line.curve = function(_) {
      return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
    };

    line.context = function(_) {
      return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
    };

    return line;
  }

  // Additional shapes, stacking, symbols, etc...

  exports.arc = arc;
  exports.line = line;
  // Exports for other shapes, symbols, offset and order functions...

  Object.defineProperty(exports, '__esModule', { value: true });

}));
