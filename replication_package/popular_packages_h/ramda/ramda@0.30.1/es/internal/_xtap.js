import _xfBase from "./_xfBase.js";
var XTap = /*#__PURE__*/function () {
  function XTap(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XTap.prototype['@@transducer/init'] = _xfBase.init;
  XTap.prototype['@@transducer/result'] = _xfBase.result;
  XTap.prototype['@@transducer/step'] = function (result, input) {
    this.f(input);
    return this.xf['@@transducer/step'](result, input);
  };
  return XTap;
}();
export default function _xtap(f) {
  return function (xf) {
    return new XTap(f, xf);
  };
}