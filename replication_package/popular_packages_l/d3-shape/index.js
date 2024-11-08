const d3 = (function() {
  function line() {
    let x = d => d[0];
    let y = d => d[1];
    let defined = () => true;
    let context = null;
    let curve = (context) => lineLinear(context);

    function line(data) {
      let buffer;
      if (!context) buffer = context = d3Path();
      let n = data.length;
      for (let i = 0; i < n; ++i) {
        if (defined(data[i], i, data)) {
          const x1 = +x(data[i], i, data);
          const y1 = +y(data[i], i, data);
          context.lineTo(x1, y1);
        }
      }
      if (buffer) return context.result();
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

    line.context = function(_) {
      return arguments.length ? (context = _, line) : context;
    };

    line.curve = function(_) {
      return arguments.length ? (curve = _, line) : curve;
    };

    return line;
  }

  function d3Path() {
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
