const d3 = (() => {
  // Main function to create a line generator
  function createLineGenerator() {
    let getX = d => d[0];
    let getY = d => d[1];
    let isDefined = () => true;
    let currentContext = null;
    let drawCurve = context => useLinearCurve(context);

    function line(data) {
      let bufferContext;
      if (!currentContext) bufferContext = currentContext = createPath();
      data.forEach((point, index) => {
        if (isDefined(point, index, data)) {
          const x = +getX(point, index, data);
          const y = +getY(point, index, data);
          currentContext.lineTo(x, y);
        }
      });
      if (bufferContext) return currentContext.result();
    }

    line.x = function(accessor) {
      if (!arguments.length) return getX;
      getX = typeof accessor === 'function' ? accessor : createConstantFunction(+accessor);
      return line;
    };

    line.y = function(accessor) {
      if (!arguments.length) return getY;
      getY = typeof accessor === 'function' ? accessor : createConstantFunction(+accessor);
      return line;
    };

    line.defined = function(condition) {
      if (!arguments.length) return isDefined;
      isDefined = typeof condition === 'function' ? condition : createConstantFunction(!!condition);
      return line;
    };

    line.context = function(context) {
      if (!arguments.length) return currentContext;
      currentContext = context;
      return line;
    };

    line.curve = function(curveFunction) {
      if (!arguments.length) return drawCurve;
      drawCurve = curveFunction;
      return line;
    };

    return line;
  }

  function createPath() {
    let pathString = "";
    return {
      moveTo(x, y) {
        pathString += `M${x},${y}`;
      },
      lineTo(x, y) {
        pathString += `L${x},${y}`;
      },
      result() {
        return pathString;
      }
    };
  }

  function useLinearCurve(context) {
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

  function createConstantFunction(value) {
    return () => value;
  }

  return {
    line: createLineGenerator
  };
})();

module.exports = d3;
