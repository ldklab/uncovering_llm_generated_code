var _xfBase = /*#__PURE__*/require("./_xfBase.js");
var XDropLast = /*#__PURE__*/function () {
  function XDropLast(n, xf) {
    if (n <= 0) {
      return xf;
    }
    this.xf = xf;
    this.pos = 0;
    this.full = false;
    this.acc = new Array(n);
  }
  XDropLast.prototype['@@transducer/init'] = _xfBase.init;
  XDropLast.prototype['@@transducer/result'] = function (result) {
    this.acc = null;
    return this.xf['@@transducer/result'](result);
  };
  XDropLast.prototype['@@transducer/step'] = function (result, input) {
    if (this.full) {
      result = this.xf['@@transducer/step'](result, this.acc[this.pos]);
    }
    this.store(input);
    return result;
  };
  XDropLast.prototype.store = function (input) {
    this.acc[this.pos] = input;
    this.pos += 1;
    if (this.pos === this.acc.length) {
      this.pos = 0;
      this.full = true;
    }
  };
  return XDropLast;
}();
function _xdropLast(n) {
  return function (xf) {
    return new XDropLast(n, xf);
  };
}
module.exports = _xdropLast;