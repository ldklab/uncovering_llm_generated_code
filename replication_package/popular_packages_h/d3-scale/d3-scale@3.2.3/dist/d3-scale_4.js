// Rewritten version using UMD pattern for D3.js scale functions definition
(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS environment (Node.js)
    factory(exports, require('d3-array'), require('d3-interpolate'), require('d3-format'), require('d3-time'), require('d3-time-format'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD environment
    define(['exports', 'd3-array', 'd3-interpolate', 'd3-format', 'd3-time', 'd3-time-format'], factory);
  } else {
    // Browser global environment
    (global = global || self, factory(global.d3 = global.d3 || {}, global.d3, global.d3, global.d3, global.d3, global.d3));
  }
}(this, function (exports, d3Array, d3Interpolate, d3Format, d3Time, d3TimeFormat) {
  'use strict';

  const implicit = Symbol("implicit");

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0: break;
      case 1: this.range(domain); break;
      default: this.range(range).domain(domain); break;
    }
    return this;
  }

  function initInterpolator(domain, interpolator) {
    switch (arguments.length) {
      case 0: break;
      case 1: {
        if (typeof domain === "function") this.interpolator(domain);
        else this.range(domain);
        break;
      }
      default: {
        this.domain(domain);
        if (typeof interpolator === "function") this.interpolator(interpolator);
        else this.range(interpolator);
        break;
      }
    }
    return this;
  }

  function ordinal() {
    var index = new Map(),
        domain = [],
        range = [],
        unknown = implicit;

    function scale(d) {
      var key = d + "", i = index.get(key);
      if (!i) {
        if (unknown !== implicit) return unknown;
        index.set(key, i = domain.push(d));
      }
      return range[(i - 1) % range.length];
    }

    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [], index = new Map();
      for (const value of _) {
        const key = value + "";
        if (index.has(key)) continue;
        index.set(key, domain.push(value));
      }
      return scale;
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), scale) : range.slice();
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    scale.copy = function() {
      return ordinal(domain, range).unknown(unknown);
    };

    initRange.apply(scale, arguments);

    return scale;
  }

  function transformer() {
    var domain = [0, 1],
        range = [0, 1],
        interpolate = d3Interpolate.interpolate,
        transform = identity,
        untransform = identity,
        unknown,
        clamp = identity,
        piecewise,
        output,
        input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
    }

    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), d3Interpolate.interpolateNumber)))(y)));
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = Array.from(_), interpolate = d3Interpolate.interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate = _, rescale()) : interpolate;
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }

  function linear() {
    var scale = continuous();

    scale.copy = function() {
      return copy(scale, linear());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  function continuous() {
    return transformer()(identity, identity);
  }

  exports.scaleOrdinal = ordinal;
  exports.scaleLinear = linear;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
