(function(global, factory) {
    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    "use strict";

    var jQuery = function(selector, context) {
        return new jQuery.fn.init(selector, context);
    };

    jQuery.fn = jQuery.prototype = {
        jquery: "3.7.1",
        constructor: jQuery,
        length: 0,
        toArray: function() {
            return slice.call(this);
        },
        get: function(num) {
            return num == null ? slice.call(this) : (num < 0 ? this[num + this.length] : this[num]);
        },
        pushStack: function(elems) {
            var ret = jQuery.merge(this.constructor(), elems);
            ret.prevObject = this;
            return ret;
        },
        each: function(callback) {
            return jQuery.each(this, callback);
        },
        map: function(callback) {
            return this.pushStack(jQuery.map(this, function(elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        slice: function() {
            return this.pushStack(slice.apply(this, arguments));
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        even: function() {
            return this.pushStack(jQuery.grep(this, function(_elem, i) {
                return (i + 1) % 2;
            }));
        },
        odd: function() {
            return this.pushStack(jQuery.grep(this, function(_elem, i) {
                return i % 2;
            }));
        },
        eq: function(i) {
            var len = this.length,
                j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        end: function() {
            return this.prevObject || this.constructor();
        },
        push: push,
        sort: arr.sort,
        splice: arr.splice
    };

    jQuery.extend = jQuery.fn.extend = function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

        if(typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
        }

        if(typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        if(i === length) {
            target = this;
            i--;
        }

        for(; i < length; i++) {
            if((options = arguments[i]) != null) {
                for(name in options) {
                    copy = options[name];
                    if(name === "__proto__" || target === copy) {
                        continue;
                    }
                    if(deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                        src = target[name];
                        if(copyIsArray && !Array.isArray(src)) {
                            clone = [];
                        } else if(!copyIsArray && !jQuery.isPlainObject(src)) {
                            clone = {};
                        } else {
                            clone = src;
                        }
                        copyIsArray = false;
                        target[name] = jQuery.extend(deep, clone, copy);
                    } else if(copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };

    jQuery.extend({
        expando: "jQuery" + ("3.7.1" + Math.random()).replace(/\D/g, ""),
        isReady: true,
        error: function(msg) {
            throw new Error(msg);
        },
        noop: function() {},
        isPlainObject: function(obj) {
            var proto, Ctor;
            if(!obj || toString.call(obj) !== "[object Object]") {
                return false;
            }

            proto = getProto(obj);

            if(!proto) {
                return true;
            }

            Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
            return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
        },
        isEmptyObject: function(obj) {
            var name;
            for(name in obj) {
                return false;
            }
            return true;
        },
        globalEval: function(code, options, doc) {
            DOMEval(code, { nonce: options && options.nonce }, doc);
        },
        each: function(obj, callback) {
            var length, i = 0;
            if(isArrayLike(obj)) {
                length = obj.length;
                for(; i < length; i++) {
                    if(callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {
                for(i in obj) {
                    if(callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }
            return obj;
        },
        makeArray: function(arr, results) {
            var ret = results || [];
            if(arr != null) {
                if(isArrayLike(Object(arr))) {
                    jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
                } else {
                    push.call(ret, arr);
                }
            }
            return ret;
        },
        inArray: function(elem, arr, i) {
            return arr == null ? -1 : indexOf.call(arr, elem, i);
        },
        merge: function(first, second) {
            var len = +second.length,
                j = 0,
                i = first.length;
            for(; j < len; j++) {
                first[i++] = second[j];
            }
            first.length = i;
            return first;
        },
        grep: function(elems, callback, invert) {
            var callbackInverse,
                matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;
            for(; i < length; i++) {
                callbackInverse = !callback(elems[i], i);
                if(callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }
            return matches;
        },
        map: function(elems, callback, arg) {
            var length, value,
                i = 0,
                ret = [];
            if(isArrayLike(elems)) {
                length = elems.length;
                for(; i < length; i++) {
                    value = callback(elems[i], i, arg);
                    if(value != null) {
                        ret.push(value);
                    }
                }
            } else {
                for(i in elems) {
                    value = callback(elems[i], i, arg);
                    if(value != null) {
                        ret.push(value);
                    }
                }
            }
            return flat(ret);
        },
        guid: 1,
        support: support
    });

    if(typeof Symbol === "function") {
        jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
    }

    jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(_i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    // Utilities and internal setup of jQuery
    function isArrayLike(obj) {
        var length = !!obj && "length" in obj && obj.length,
            type = toType(obj);
        if(isFunction(obj) || isWindow(obj)) {
            return false;
        }
        return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }

    function DOMEval(code, node, doc) {
        doc = doc || document;
        var script = doc.createElement("script");
        script.text = code;
        if(node) {
            for(var i in preservedScriptAttributes) {
                var val = node[i] || node.getAttribute && node.getAttribute(i);
                if(val) {
                    script.setAttribute(i, val);
                }
            }
        }
        doc.head.appendChild(script).parentNode.removeChild(script);
    }

    function toType(obj) {
        if(obj == null) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj;
    }

    var support = {},
        isFunction = function isFunction(obj) {
            return typeof obj === "function" && typeof obj.nodeType !== "number" && typeof obj.item !== "function";
        },
        isWindow = function isWindow(obj) {
            return obj != null && obj === obj.window;
        },
        slice = arr.slice,
        indexOf = arr.indexOf,
        push = arr.push,
        flat = arr.flat ? function(array) {
            return arr.flat.call(array);
        } : function(array) {
            return arr.concat.apply([], array);
        },
        class2type = {},
        toString = class2type.toString,
        hasOwn = class2type.hasOwnProperty,
        fnToString = hasOwn.toString,
        ObjectFunctionString = fnToString.call(Object),
        preservedScriptAttributes = {
            type: true,
            src: true,
            nonce: true,
            noModule: true
        };

    // Initialize and expose jQuery globally or as a module
    var version = "3.7.1",
        rootjQuery,
        init = jQuery.fn.init = function(selector, context, root) {
            var match, elem;
            if(!selector) {
                return this;
            }
            root = root || rootjQuery;
            if(typeof selector === "string") {
                if(selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
                    match = [null, selector, null];
                } else {
                    match = rquickExpr.exec(selector);
                }
                if(match && (match[1] || !context)) {
                    if(match[1]) {
                        context = context instanceof jQuery ? context[0] : context;
                        jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
                        if(rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                            for(match in context) {
                                if(isFunction(this[match])) {
                                    this[match](context[match]);
                                } else {
                                    this.attr(match, context[match]);
                                }
                            }
                        }
                        return this;
                    } else {
                        elem = document.getElementById(match[2]);
                        if(elem) {
                            this[0] = elem;
                            this.length = 1;
                        }
                        return this;
                    }
                } else if(!context || context.jquery) {
                    return (context || root).find(selector);
                } else {
                    return this.constructor(context).find(selector);
                }
            } else if(selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;
            } else if(isFunction(selector)) {
                return root.ready !== undefined ?
                    root.ready(selector) :
                    selector(jQuery);
            }
            return jQuery.makeArray(selector, this);
        };
    init.prototype = jQuery.fn;
    rootjQuery = jQuery(document);

    return jQuery;
});
