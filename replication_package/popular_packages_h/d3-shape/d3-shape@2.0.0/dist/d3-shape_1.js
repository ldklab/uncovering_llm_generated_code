(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-path'], factory) :
  (global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
}(this, function (exports, d3Path) { 'use strict';

  function constant(x) {
    return function() { return x; };
  }

  var pi = Math.PI, tau = 2 * pi, epsilon = 1e-12;

  // Arc Generator
  function arc() {
    var innerRadius = function(d) { return d.innerRadius; },
        outerRadius = function(d) { return d.outerRadius; },
        startAngle = function(d) { return d.startAngle; },
        endAngle = function(d) { return d.endAngle; },
        padAngle = function(d) { return d && d.padAngle; },
        context = null;

    function arc() {
      var buffer;
      if (!context) context = buffer = d3Path.path();
      // ...calculate and construct arc path...
      context.closePath();
      return buffer ? context = null, buffer + "" || null : null;
    }

    arc.innerRadius = function(_) {
      return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant(+_), arc) : innerRadius;
    };

    arc.outerRadius = function(_) {
      return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant(+_), arc) : outerRadius;
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
      return arguments.length ? (context = _ == null ? null : _, arc) : context;
    };

    return arc;
  }

  // Line Generator
  function line() {
    var defined = constant(true),
        context = null,
        x = function(d) { return d[0]; },
        y = function(d) { return d[1]; };

    function line(data) {
      var i, n = data.length, buffer;
      if (context == null) buffer = d3Path.path(), context = buffer;
      for (i = 0; i < n; i++) {
        if (defined(data[i], i, data)) {
          context.moveTo(x(data[i], i, data), y(data[i], i, data));
          while (++i < n) if (defined(data[i], i, data)) context.lineTo(x(data[i], i, data), y(data[i], i, data));
        }
      }
      return buffer ? buffer + "" || null : null;
    }

    line.x = function(_) {
      return arguments.length ? (x = typeof _ === "function" ? _ : constant(+_), line) : x;
    };

    line.y = function(_) {
      return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), line) : y;
    };

    line.context = function(_) {
      return arguments.length ? ((context = _ == null ? null : _), line) : context;
    };

    return line;
  }

  // Symbol Generator
  var circle = {
    draw: function(context, size) {
      var r = Math.sqrt(size / pi);
      context.moveTo(r, 0);
      context.arc(0, 0, r, 0, tau);
    }
  };

  function symbol() {
    var type = constant(circle),
        size = constant(64),
        context = null;

    function symbol() {
      var buffer;
      if (!context) context = buffer = d3Path.path();
      type.draw(context, +size.apply(this, arguments));
      return buffer ? buffer + "" || null : null;
    }

    symbol.type = function(_) {
      return arguments.length ? (type = typeof _ === "function" ? _ : constant(_), symbol) : type;
    };

    symbol.size = function(_) {
      return arguments.length ? (size = typeof _ === "function" ? _ : constant(+_), symbol) : size;
    };

    symbol.context = function(_) {
      return arguments.length ? (context = _ == null ? null : _, symbol) : context;
    };

    return symbol;
  }

  exports.arc = arc;
  exports.line = line;
  exports.symbol = symbol;
  exports.symbolCircle = circle;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
