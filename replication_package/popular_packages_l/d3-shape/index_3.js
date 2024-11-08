const d3 = (() => {
  function line() {
    let x = d => d[0],
        y = d => d[1],
        defined = () => true,
        context = null,
        curve = context => lineLinear(context);

    function line(data) {
      let buffer;
      if (!context) buffer = context = createPath();
      data.forEach((d, i) => {
        if (defined(d, i, data)) {
          const x1 = +x(d, i, data),
                y1 = +y(d, i, data);
          context.lineTo(x1, y1);
        }
      });
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
