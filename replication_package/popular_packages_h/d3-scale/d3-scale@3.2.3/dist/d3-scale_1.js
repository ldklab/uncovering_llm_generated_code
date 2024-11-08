(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports, require('d3-array'), require('d3-interpolate'), require('d3-format'), require('d3-time'), require('d3-time-format'));
  } else if (typeof define === 'function' && define.amd) {
    define(['exports', 'd3-array', 'd3-interpolate', 'd3-format', 'd3-time', 'd3-time-format'], factory);
  } else {
    global = global || self;
    factory(global.d3 = global.d3 || {}, global.d3, global.d3, global.d3, global.d3, global.d3);
  }
}(this, (exports, d3Array, d3Interpolate, d3Format, d3Time, d3TimeFormat) => {
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
      case 1:
        typeof domain === "function" ? this.interpolator(domain) : this.range(domain);
        break;
      default:
        this.domain(domain);
        typeof interpolator === "function" ? this.interpolator(interpolator) : this.range(interpolator);
        break;
    }
    return this;
  }

  function ordinal() {
    let index = new Map(),
      domain = [],
      range = [],
      unknown = implicit;

    function scale(d) {
      const key = d + "", i = index.get(key);
      if (!i) {
        if (unknown !== implicit) return unknown;
        index.set(key, i = domain.push(d));
      }
      return range[(i - 1) % range.length];
    }

    scale.domain = function (_) {
      if (!arguments.length) return domain.slice();
      domain = [];
      index = new Map();
      for (const value of _) {
        const key = value + "";
        if (index.has(key)) continue;
        index.set(key, domain.push(value));
      }
      return scale;
    };

    scale.range = function (_) {
      return arguments.length ? (range = Array.from(_), scale) : range.slice();
    };

    scale.unknown = function (_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    scale.copy = function () {
      return ordinal(domain, range).unknown(unknown);
    };

    initRange.apply(scale, arguments);
    return scale;
  }

  // Similar implementations for band(), point(), and other scale functions...

  exports.scaleBand = band;
  exports.scaleDiverging = diverging;
  exports.scaleDivergingLog = divergingLog;
  exports.scaleDivergingPow = divergingPow;
  exports.scaleDivergingSqrt = divergingSqrt;
  exports.scaleDivergingSymlog = divergingSymlog;
  exports.scaleIdentity = identity$1;
  exports.scaleImplicit = implicit;
  exports.scaleLinear = linear;
  exports.scaleLog = log;
  exports.scaleOrdinal = ordinal;
  exports.scalePoint = point;
  exports.scalePow = pow;
  exports.scaleQuantile = quantile;
  exports.scaleQuantize = quantize;
  exports.scaleRadial = radial;
  exports.scaleSequential = sequential;
  exports.scaleSequentialLog = sequentialLog;
  exports.scaleSequentialPow = sequentialPow;
  exports.scaleSequentialQuantile = sequentialQuantile;
  exports.scaleSequentialSqrt = sequentialSqrt;
  exports.scaleSequentialSymlog = sequentialSymlog;
  exports.scaleSqrt = sqrt;
  exports.scaleSymlog = symlog;
  exports.scaleThreshold = threshold;
  exports.scaleTime = time;
  exports.scaleUtc = utcTime;
  exports.tickFormat = tickFormat;

  Object.defineProperty(exports, '__esModule', { value: true });
}));
