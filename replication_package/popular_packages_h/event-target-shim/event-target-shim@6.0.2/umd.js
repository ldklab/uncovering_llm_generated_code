!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).EventTargetShim={})}(this,(function(e){"use strict";function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function o(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&s(e,t)}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e,t){return(s=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}function p(e,t,n){return(p=f()?Reflect.construct:function(e,t,n){var r=[null];r.push.apply(r,t);var o=new(Function.bind.apply(e,r));return n&&s(o,n.prototype),o}).apply(null,arguments)}function g(e){var t="function"==typeof Map?new Map:void 0;return(g=function(e){if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;var n;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,r)}function r(){return p(e,arguments,l(this).constructor)}return r.prototype=Object.create(e.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),s(r,e)})(e)}function b(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function y(e,t){return!t||"object"!=typeof t&&"function"!=typeof t?b(e):t}function v(e){var t=f();return function(){var n,r=l(e);if(t){var o=l(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return y(this,n)}}function d(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=l(e)););return e}function h(e,t,n){return(h="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=d(e,t);if(r){var o=Object.getOwnPropertyDescriptor(r,t);return o.get?o.get.call(n):o.value}})(e,t,n||e)}function E(e,t,n,r){return(E="undefined"!=typeof Reflect&&Reflect.set?Reflect.set:function(e,t,n,r){var o,i=d(e,t);if(i){if((o=Object.getOwnPropertyDescriptor(i,t)).set)return o.set.call(r,n),!0;if(!o.writable)return!1}if(o=Object.getOwnPropertyDescriptor(r,t)){if(!o.writable)return!1;o.value=n,Object.defineProperty(r,t,o)}else a(r,t,n);return!0})(e,t,n,r)}function m(e,t,n,r,o){if(!E(e,t,n,r||e)&&o)throw new Error("failed to set property");return n}function O(e){return function(e){if(Array.isArray(e))return w(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return w(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return w(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function w(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function P(e,t){if(!e){for(var n=arguments.length,r=new Array(n>2?n-2:0),o=2;o<n;o++)r[o-2]=arguments[o];throw new TypeError(R(t,r))}}function R(e,t){var n=0;return e.replace(/%[os]/g,(function(){return T(t[n++])}))}function T(e){return"object"!==t(e)||null===e?String(e):Object.prototype.toString.call(e)}var k;var j,_="undefined"!=typeof window?window:"undefined"!=typeof self?self:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:void 0;var A=function(){function e(t,r){n(this,e),this.code=t,this.message=r}return o(e,[{key:"warn",value:function(){var e;try{for(var t,n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];if(j)return void j(u(u({},this),{},{args:r}));var a=(null!==(e=(new Error).stack)&&void 0!==e?e:"").replace(/^(?:(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+?\n){2}/g,"\n");(t=console).warn.apply(t,[this.message].concat(r,[a]))}catch(e){}}}]),e}(),S=new A("W01","Unable to initialize event under dispatching."),F=new A("W02","Assigning any falsy value to 'cancelBubble' property has no effect."),D=new A("W03","Assigning any truthy value to 'returnValue' property has no effect."),I=new A("W04","Unable to preventDefault on non-cancelable events."),N=new A("W05","Unable to preventDefault inside passive event listener invocation."),B=new A("W06","An event listener wasn't added because it has been added already: %o, %o"),L=new A("W07","The %o option value was abandoned because the event listener wasn't added as duplicated."),C=new A("W08","The 'callback' argument must be a function or an object that has 'handleEvent' method: %o"),M=new A("W09","Event attribute handler must be a function: %o"),U=function(){function e(t,r){n(this,e),Object.defineProperty(this,"isTrusted",{value:!1,enumerable:!0});var o=null!=r?r:{};G.set(this,{type:String(t),bubbles:Boolean(o.bubbles),cancelable:Boolean(o.cancelable),composed:Boolean(o.composed),target:null,currentTarget:null,stopPropagationFlag:!1,stopImmediatePropagationFlag:!1,canceledFlag:!1,inPassiveListenerFlag:!1,dispatchFlag:!1,timeStamp:Date.now()})}return o(e,null,[{key:"NONE",get:function(){return W}},{key:"CAPTURING_PHASE",get:function(){return V}},{key:"AT_TARGET",get:function(){return x}},{key:"BUBBLING_PHASE",get:function(){return H}}]),o(e,[{key:"composedPath",value:function(){var e=Y(this).currentTarget;return e?[e]:[]}},{key:"stopPropagation",value:function(){Y(this).stopPropagationFlag=!0}},{key:"stopImmediatePropagation",value:function(){var e=Y(this);e.stopPropagationFlag=e.stopImmediatePropagationFlag=!0}},{key:"preventDefault",value:function(){X(Y(this))}},{key:"initEvent",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=Y(this);r.dispatchFlag?S.warn():G.set(this,u(u({},r),{},{type:String(e),bubbles:Boolean(t),cancelable:Boolean(n),target:null,currentTarget:null,stopPropagationFlag:!1,stopImmediatePropagationFlag:!1,canceledFlag:!1}))}},{key:"type",get:function(){return Y(this).type}},{key:"target",get:function(){return Y(this).target}},{key:"srcElement",get:function(){return Y(this).target}},{key:"currentTarget",get:function(){return Y(this).currentTarget}},{key:"NONE",get:function(){return W}},{key:"CAPTURING_PHASE",get:function(){return V}},{key:"AT_TARGET",get:function(){return x}},{key:"BUBBLING_PHASE",get:function(){return H}},{key:"eventPhase",get:function(){return Y(this).dispatchFlag?2:0}},{key:"cancelBubble",get:function(){return Y(this).stopPropagationFlag},set:function(e){e?Y(this).stopPropagationFlag=!0:F.warn()}},{key:"bubbles",get:function(){return Y(this).bubbles}},{key:"cancelable",get:function(){return Y(this).cancelable}},{key:"returnValue",get:function(){return!Y(this).canceledFlag},set:function(e){e?D.warn():X(Y(this))}},{key:"defaultPrevented",get:function(){return Y(this).canceledFlag}},{key:"composed",get:function(){return Y(this).composed}},{key:"isTrusted",get:function(){return!1}},{key:"timeStamp",get:function(){return Y(this).timeStamp}}]),e}(),W=0,V=1,x=2,H=3,G=new WeakMap;function Y(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"this",n=G.get(e);return P(null!=n,"'%s' must be an object that Event constructor created, but got another one: %o",t,e),n}function X(e){e.inPassiveListenerFlag?N.warn():e.cancelable?e.canceledFlag=!0:I.warn()}Object.defineProperty(U,"NONE",{enumerable:!0}),Object.defineProperty(U,"CAPTURING_PHASE",{enumerable:!0}),Object.defineProperty(U,"AT_TARGET",{enumerable:!0}),Object.defineProperty(U,"BUBBLING_PHASE",{enumerable:!0});for(var Q,Z=Object.getOwnPropertyNames(U.prototype),z=0;z<Z.length;++z)"constructor"!==Z[z]&&Object.defineProperty(U.prototype,Z[z],{enumerable:!0});void 0!==_&&void 0!==_.Event&&Object.setPrototypeOf(U.prototype,_.Event.prototype);var K={INDEX_SIZE_ERR:1,DOMSTRING_SIZE_ERR:2,HIERARCHY_REQUEST_ERR:3,WRONG_DOCUMENT_ERR:4,INVALID_CHARACTER_ERR:5,NO_DATA_ALLOWED_ERR:6,NO_MODIFICATION_ALLOWED_ERR:7,NOT_FOUND_ERR:8,NOT_SUPPORTED_ERR:9,INUSE_ATTRIBUTE_ERR:10,INVALID_STATE_ERR:11,SYNTAX_ERR:12,INVALID_MODIFICATION_ERR:13,NAMESPACE_ERR:14,INVALID_ACCESS_ERR:15,VALIDATION_ERR:16,TYPE_MISMATCH_ERR:17,SECURITY_ERR:18,NETWORK_ERR:19,ABORT_ERR:20,URL_MISMATCH_ERR:21,QUOTA_EXCEEDED_ERR:22,TIMEOUT_ERR:23,INVALID_NODE_TYPE_ERR:24,DATA_CLONE_ERR:25};function $(e){for(var t=Object.keys(K),n=function(n){var r=t[n],o=K[r];Object.defineProperty(e,r,{get:function(){return o},configurable:!0,enumerable:!0})},r=0;r<t.length;++r)n(r)}var q=function(e){c(r,e);var t=v(r);function r(e){var o,a,i;n(this,r),i=t.call(this,e.type,{bubbles:e.bubbles,cancelable:e.cancelable,composed:e.composed}),e.cancelBubble&&h((o=b(i),l(r.prototype)),"stopPropagation",o).call(o),e.defaultPrevented&&h((a=b(i),l(r.prototype)),"preventDefault",a).call(a),J.set(b(i),{original:e});for(var u=Object.keys(e),c=0;c<u.length;++c){var s=u[c];s in b(i)||Object.defineProperty(b(i),s,re(e,s))}return i}return o(r,null,[{key:"wrap",value:function(e){return new(ne(e))(e)}}]),o(r,[{key:"stopPropagation",value:function(){h(l(r.prototype),"stopPropagation",this).call(this);var e=ee(this).original;"stopPropagation"in e&&e.stopPropagation()}},{key:"stopImmediatePropagation",value:function(){h(l(r.prototype),"stopImmediatePropagation",this).call(this);var e=ee(this).original;"stopImmediatePropagation"in e&&e.stopImmediatePropagation()}},{key:"preventDefault",value:function(){h(l(r.prototype),"preventDefault",this).call(this);var e=ee(this).original;"preventDefault"in e&&e.preventDefault()}},{key:"cancelBubble",get:function(){return h(l(r.prototype),"cancelBubble",this)},set:function(e){m(l(r.prototype),"cancelBubble",e,this,!0);var t=ee(this).original;"cancelBubble"in t&&(t.cancelBubble=e)}},{key:"returnValue",get:function(){return h(l(r.prototype),"returnValue",this)},set:function(e){m(l(r.prototype),"returnValue",e,this,!0);var t=ee(this).original;"returnValue"in t&&(t.returnValue=e)}},{key:"timeStamp",get:function(){var e=ee(this).original;return"timeStamp"in e?e.timeStamp:h(l(r.prototype),"timeStamp",this)}}]),r}(U),J=new WeakMap;function ee(e){var t=J.get(e);return P(null!=t,"'this' is expected an Event object, but got",e),t}var te=new WeakMap;function ne(e){var t=Object.getPrototypeOf(e);if(null==t)return q;var r=te.get(t);return null==r&&(r=function(e,t){for(var r=function(e){c(r,e);var t=v(r);function r(){return n(this,r),t.apply(this,arguments)}return r}(e),o=Object.keys(t),a=0;a<o.length;++a)Object.defineProperty(r.prototype,o[a],re(t,o[a]));return r}(ne(t),t),te.set(t,r)),r}function re(e,t){var n=Object.getOwnPropertyDescriptor(e,t);return{get:function(){var e=ee(this).original,n=e[t];return"function"==typeof n?n.bind(e):n},set:function(e){ee(this).original[t]=e},configurable:n.configurable,enumerable:n.enumerable}}function oe(e){e.flags|=8}function ae(e){return 1==(1&e.flags)}function ie(e){return 2==(2&e.flags)}function ue(e){return 4==(4&e.flags)}function ce(e){return 8==(8&e.flags)}function le(e,t,n){var r=e.callback;try{"function"==typeof r?r.call(t,n):"function"==typeof r.handleEvent&&r.handleEvent(n)}catch(e){!function(e){try{var t=e instanceof Error?e:new Error(T(e));if(k)return void k(t);if("function"==typeof dispatchEvent&&"function"==typeof ErrorEvent)dispatchEvent(new ErrorEvent("error",{error:t,message:t.message}));else if("undefined"!=typeof process&&"function"==typeof process.emit)return void process.emit("uncaughtException",t);console.error(t)}catch(e){}}(e)}}function se(e,t,n){for(var r=e.listeners,o=0;o<r.length;++o)if(r[o].callback===t&&ae(r[o])===n)return o;return-1}function fe(e,t,n,r,o,a){var i;a&&(i=pe.bind(null,e,t,n),a.addEventListener("abort",i));var u=function(e,t,n,r,o,a){return{callback:e,flags:(t?1:0)|(n?2:0)|(r?4:0),signal:o,signalListener:a}}(t,n,r,o,a,i);return e.cow?(e.cow=!1,e.listeners=[].concat(O(e.listeners),[u])):e.listeners.push(u),u}function pe(e,t,n){var r=se(e,t,n);return-1!==r&&ge(e,r)}function ge(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=e.listeners[t];return oe(r),r.signal&&r.signal.removeEventListener("abort",r.signalListener),e.cow&&!n?(e.cow=!1,e.listeners=e.listeners.filter((function(e,n){return n!==t})),!1):(e.listeners.splice(t,1),!0)}function be(e,t){var n;return null!==(n=e[t])&&void 0!==n?n:e[t]={attrCallback:void 0,attrListener:void 0,cow:!1,listeners:[]}}te.set(Object.prototype,q),void 0!==_&&void 0!==_.Event&&te.set(_.Event.prototype,q);var ye=function(){function e(){n(this,e),ve.set(this,Object.create(null))}return o(e,[{key:"addEventListener",value:function(e,n,r){var o=de(this),a=function(e,n,r){var o;if(he(n),"object"===t(r)&&null!==r)return{type:String(e),callback:null!=n?n:void 0,capture:Boolean(r.capture),passive:Boolean(r.passive),once:Boolean(r.once),signal:null!==(o=r.signal)&&void 0!==o?o:void 0};return{type:String(e),callback:null!=n?n:void 0,capture:Boolean(r),passive:!1,once:!1,signal:void 0}}(e,n,r),i=a.callback,u=a.capture,c=a.once,l=a.passive,s=a.signal,f=a.type;if(null!=i&&!(null==s?void 0:s.aborted)){var p=be(o,f),g=se(p,i,u);-1===g?fe(p,i,u,l,c,s):function(e,t,n,r){B.warn(ae(e)?"capture":"bubble",e.callback),ie(e)!==t&&L.warn("passive");ue(e)!==n&&L.warn("once");e.signal!==r&&L.warn("signal")}(p.listeners[g],l,c,s)}}},{key:"removeEventListener",value:function(e,n,r){var o=de(this),a=function(e,n,r){if(he(n),"object"===t(r)&&null!==r)return{type:String(e),callback:null!=n?n:void 0,capture:Boolean(r.capture)};return{type:String(e),callback:null!=n?n:void 0,capture:Boolean(r)}}(e,n,r),i=a.callback,u=a.capture,c=o[a.type];null!=i&&c&&pe(c,i,u)}},{key:"dispatchEvent",value:function(e){var t=de(this)[String(e.type)];if(null==t)return!0;var r,a=e instanceof U?e:q.wrap(e),i=Y(a,"event");if(i.dispatchFlag)throw r="This event has been in dispatching.",_.DOMException?new _.DOMException(r,"InvalidStateError"):(null==Q&&(Q=function(e){c(r,e);var t=v(r);function r(e){var o;return n(this,r),o=t.call(this,e),Error.captureStackTrace&&Error.captureStackTrace(b(o),r),o}return o(r,[{key:"code",get:function(){return 11}},{key:"name",get:function(){return"InvalidStateError"}}]),r}(g(Error)),Object.defineProperties(Q.prototype,{code:{enumerable:!0},name:{enumerable:!0}}),$(Q),$(Q.prototype)),new Q(r));if(i.dispatchFlag=!0,i.target=i.currentTarget=this,!i.stopPropagationFlag){var u=t.cow,l=t.listeners;t.cow=!0;for(var s=0;s<l.length;++s){var f=l[s];if(!ce(f)&&(ue(f)&&ge(t,s,!u)&&(s-=1),i.inPassiveListenerFlag=ie(f),le(f,this,a),i.inPassiveListenerFlag=!1,i.stopImmediatePropagationFlag))break}u||(t.cow=!1)}return i.target=null,i.currentTarget=null,i.stopImmediatePropagationFlag=!1,i.stopPropagationFlag=!1,i.dispatchFlag=!1,!i.canceledFlag}}]),e}(),ve=new WeakMap;function de(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"this",n=ve.get(e);return P(null!=n,"'%s' must be an object that EventTarget constructor created, but got another one: %o",t,e),n}function he(e){if("function"!=typeof e&&("object"!==t(e)||null===e||"function"!=typeof e.handleEvent)){if(null!=e&&"object"!==t(e))throw new TypeError(R(C.message,[e]));C.warn(e)}}for(var Ee=Object.getOwnPropertyNames(ye.prototype),me=0;me<Ee.length;++me)"constructor"!==Ee[me]&&Object.defineProperty(ye.prototype,Ee[me],{enumerable:!0});function Oe(e,t){var n,r;return null!==(r=null===(n=de(e,"target")[t])||void 0===n?void 0:n.attrCallback)&&void 0!==r?r:null}function we(e,n,r){null!=r&&"function"!=typeof r&&M.warn(r),"function"==typeof r||"object"===t(r)&&null!==r?function(e,t,n){var r=be(de(e,"target"),String(t));r.attrCallback=n,null==r.attrListener&&(r.attrListener=fe(r,function(e){return function(t){var n=e.attrCallback;"function"==typeof n&&n.call(this,t)}}(r),!1,!1,!1,void 0))}(e,n,r):function(e,t){var n=de(e,"target")[String(t)];n&&n.attrListener&&(pe(n,n.attrListener.callback,!1),n.attrCallback=n.attrListener=void 0)}(e,n)}function Pe(e,t,n){Object.defineProperty(e,"on".concat(t),{get:function(){return Oe(this,t)},set:function(e){we(this,t,e)},configurable:!0,enumerable:!0})}void 0!==_&&void 0!==_.EventTarget&&Object.setPrototypeOf(ye.prototype,_.EventTarget.prototype),e.Event=U,e.EventTarget=ye,e.default=ye,e.defineCustomEventTarget=function(){for(var e=function(e){c(r,e);var t=v(r);function r(){return n(this,r),t.apply(this,arguments)}return r}(ye),t=0;t<arguments.length;++t)Pe(e.prototype,t<0||arguments.length<=t?void 0:arguments[t]);return e},e.defineEventAttribute=Pe,e.getEventAttributeValue=Oe,e.setErrorHandler=function(e){P("function"==typeof e||void 0===e,"The error handler must be a function or undefined, but got %o.",e),k=e},e.setEventAttributeValue=we,e.setWarningHandler=function(e){P("function"==typeof e||void 0===e,"The warning handler must be a function or undefined, but got %o.",e),j=e},Object.defineProperty(e,"__esModule",{value:!0})}));