var _xfBase = /*#__PURE__*/require("./_xfBase.js");
var _promap = /*#__PURE__*/require("./_promap.js");
var XPromap = /*#__PURE__*/function () {
  function XPromap(f, g, xf) {
    this.xf = xf;
    this.f = f;
    this.g = g;
  }
  XPromap.prototype['@@transducer/init'] = _xfBase.init;
  XPromap.prototype['@@transducer/result'] = _xfBase.result;
  XPromap.prototype['@@transducer/step'] = function (result, input) {
    return this.xf['@@transducer/step'](result, _promap(this.f, this.g, input));
  };
  return XPromap;
}();
function _xpromap(f, g) {
  return function (xf) {
    return new XPromap(f, g, xf);
  };
}
module.exports = _xpromap;