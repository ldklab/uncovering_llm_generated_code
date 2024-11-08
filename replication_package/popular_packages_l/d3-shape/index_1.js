const d3 = (function() {
  function line() {
    let x = d => d[0];
    let y = d => d[1];
    let defined = () => true;
    let context = null;
    let curve = (context) => lineLinear(context);

    function line(data) {
      let buffer;
      if (!context) buffer = context = createPath();
      const n = data.length;
      for (let i = 0; i < n; i++) {
        if (defined(data[i], i, data)) {
          const x1 = +x(data[i], i, data);
          const y1 = +y(data[i], i, data);
          context.lineTo(x1, y1);
        }
      }
      return buffer ? context.result() : undefined;
    }

    line.x = function(_) {
      if (!arguments.length) return x;
      x = typeof _ === "function" ? _ : constant(+_);
      return line;
    };

    line.y = function(_) {
      if (!arguments.length) return y;
      y = typeof _ === "function" ? _ : constant(+_);
      return line;
    };

    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = typeof _ === "function" ? _ : constant(!!_);
      return line;
    };

    line.context = function(_) {
      if (!arguments.length) return context;
      context = _;
      return line;
    };

    line.curve = function(_) {
      if (!arguments.length) return curve;
      curve = _;
      return line;
    };

    return line;
  }

  function createPath() {
    let path = "";
    return {
      moveTo(x, y) {
        path += `M${x},${y}`;
      },
      lineTo(x, y) {
        path += `L${x},${y}`;
      },
      result() {
        return path;
      }
    };
  }

  function lineLinear(context) {
    return {
      lineStart() {
        context.moveTo(0, 0);
      },
      lineEnd() {},
      point(x, y) {
        context.lineTo(x, y);
      }
    };
  }

  function constant(x) {
    return () => x;
  }

  return {
    line
  };
})();

module.exports = d3;
