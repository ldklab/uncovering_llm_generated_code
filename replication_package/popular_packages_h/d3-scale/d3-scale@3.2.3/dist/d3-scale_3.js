// UMD Pattern for D3 Scale Library
(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports, require('d3-array'), require('d3-interpolate'), require('d3-format'), require('d3-time'), require('d3-time-format'));
  } else if (typeof define === 'function' && define.amd) {
    define(['exports', 'd3-array', 'd3-interpolate', 'd3-format', 'd3-time', 'd3-time-format'], factory);
  } else {
    global = global || self;
    factory(global.d3 = global.d3 || {}, global.d3, global.d3, global.d3, global.d3, global.d3);
  }
}(this, function (exports, d3Array, d3Interpolate, d3Format, d3Time, d3TimeFormat) {
  'use strict';

  const implicit = Symbol("implicit");

  function createOrdinalScale() {
    let index = new Map(),
        domain = [],
        range = [],
        unknown = implicit;

    function scale(d) {
      const key = `${d}`, i = index.get(key);
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
        const key = `${value}`;
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
      return createOrdinalScale().domain(domain).range(range).unknown(unknown);
    };

    initRange.apply(scale, arguments);

    return scale;
  }

  function createBandScale() {
    const scale = createOrdinalScale().unknown(undefined);
    let { domain, range: ordinalRange } = scale;
    let r0 = 0, r1 = 1, step, bandwidth, round = false, paddingInner = 0, paddingOuter = 0, align = 0.5;

    delete scale.unknown;

    function rescale() {
      const n = domain().length, reverse = r1 < r0, start = reverse ? r1 : r0, stop = reverse ? r0 : r1;
      step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
      if (round) step = Math.floor(step);
      start += (stop - start - step * (n - paddingInner)) * align;
      bandwidth = step * (1 - paddingInner);
      if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
      const values = d3Array.range(n).map(i => start + step * i);
      return ordinalRange(reverse ? values.reverse() : values);
    }

    scale.domain = _ => arguments.length ? (domain(_), rescale()) : domain();
    scale.range = _ => arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
    scale.rangeRound = _ => ([r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale());
    scale.bandwidth = () => bandwidth;
    scale.step = () => step;
    scale.round = _ => arguments.length ? (round = !!_, rescale()) : round;
    scale.padding = _ => arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
    scale.paddingInner = _ => arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
    scale.paddingOuter = _ => arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
    scale.align = _ => arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
    scale.copy = () => createBandScale().domain(domain()).range([r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
    
    return initRange.apply(rescale(), arguments);
  }

  function createLinearScale() {
    const scale = continuous();

    scale.copy = () => createLinearScale().domain(scale.domain()).range(scale.range()).interpolate(scale.interpolate()).clamp(scale.clamp()).unknown(scale.unknown());

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  function initRange(domain, range) {
    if (arguments.length === 1) {
      this.range(domain);
    } else if (arguments.length > 1) {
      this.range(range).domain(domain);
    }
    return this;
  }

  function continuous() {
    return transformer()(identity, identity);
  }

  function transformer() {
    let domain = [0, 1],
        range = [0, 1],
        interpolate = d3Interpolate.interpolate,
        transform,
        untransform,
        unknown,
        clamp = identity,
        piecewise,
        output,
        input;

    function rescale() {
      const n = Math.min(domain.length, range.length);
      if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
    }

    scale.invert = y => clamp(untransform((input || (input = piecewise(range, domain.map(transform), d3Interpolate.interpolateNumber)))(y)));

    scale.domain = _ => arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
    scale.range = _ => arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    scale.rangeRound = _ => (range = Array.from(_), interpolate = d3Interpolate.interpolateRound, rescale());
    scale.clamp = _ => arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
    scale.interpolate = _ => arguments.length ? (interpolate = _, rescale()) : interpolate;
    scale.unknown = _ => arguments.length ? (unknown = _, scale) : unknown;

    return (t, u) => {
      transform = t, untransform = u;
      return rescale();
    };
  }

  function linearish(scale) {
    const domain = scale.domain;

    scale.ticks = count => {
      const d = domain();
      return d3Array.ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = (count, specifier) => {
      const d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = count => {
      if (count == null) count = 10;

      const d = domain();
      let i0 = 0,
          i1 = d.length - 1,
          start = d[i0],
          stop = d[i1],
          prestep,
          step,
          maxIter = 10;

      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      
      while (maxIter-- > 0) {
        step = d3Array.tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }

      return scale;
    };

    return scale;
  }

  function tickFormat(start, stop, count, specifier) {
    const step = d3Array.tickStep(start, stop, count);
    let precision;
    specifier = d3Format.formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        const value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = d3Format.precisionPrefix(step, value))) specifier.precision = precision;
        return d3Format.formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = d3Format.precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = d3Format.precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return d3Format.format(specifier);
  }
  
  exports.scaleOrdinal = createOrdinalScale;
  exports.scaleBand = createBandScale;
  exports.scaleLinear = createLinearScale;
  exports.scaleImplicit = implicit;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

