const d3 = (function() {
  function line() {
    let x = d => d[0];
    let y = d => d[1];
    let defined = () => true; // Function to check if point should be included
    let context = null; // Drawing context
    let curve = context => lineLinear(context); // Default curve function

    function line(data) {
      if (!context) context = d3Path(); // Use d3Path if no context provided
      let buffer;
      if (!context) buffer = context = d3Path();
      for (let i = 0; i < data.length; i++) {
        if (defined(data[i], i, data)) {
          const x1 = +x(data[i], i, data);
          const y1 = +y(data[i], i, data);
          context.lineTo(x1, y1); // Draw line to the next point
        }
      }
      if (buffer) return context.result(); // Return path string
    }

    // Accessor functions to set or get properties for line generation
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
    let path = ""; // To store the commands
    return {
      moveTo(x, y) {
        path += `M${x},${y}`; // Move command
      },
      lineTo(x, y) {
        path += `L${x},${y}`; // Line command
      },
      result() {
        return path; // Return path string
      }
    };
  }

  function lineLinear(context) {
    return {
      lineStart() {
        context.moveTo(0, 0); // Start of line
      },
      lineEnd() {},
      point(x, y) {
        context.lineTo(x, y); // Point on line
      }
    };
  }

  function constant(x) {
    return () => x; // Return constant value function
  }

  return {
    line
  };
})();

module.exports = d3;
