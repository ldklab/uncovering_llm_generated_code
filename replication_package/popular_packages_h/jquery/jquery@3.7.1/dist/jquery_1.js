(function(global, factory) {
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

    const version = "3.7.1";
    let document = window.document;

    const jQuery = function(selector, context) {
        return new jQuery.fn.init(selector, context);
    };

    jQuery.fn = jQuery.prototype = {
        jquery: version,
        constructor: jQuery,
        length: 0,
        toArray() { return Array.prototype.slice.call(this); },
        get(num) {
            return num != null ?
                (num < 0 ? this[num + this.length] : this[num]) :
                Array.prototype.slice.call(this);
        },
        each(callback) {
            return jQuery.each(this, callback);
        },
        map(callback) {
            return this.pushStack(jQuery.map(this, (elem, i) => callback.call(elem, i, elem)));
        },
        slice() {
            return this.pushStack(Array.prototype.slice.apply(this, arguments));
        },
        first() { return this.eq(0); },
        last() { return this.eq(-1); },
        eq(i) {
            const len = this.length, j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        push: Array.prototype.push,
        sort: Array.prototype.sort,
        splice: Array.prototype.splice
    };

    jQuery.extend = jQuery.fn.extend = function() {
        let options, name, src, copy, copyIsArray, clone;
        const target = arguments[0] || {};
        let i = 1, length = arguments.length, deep = false;

        if (typeof target === "boolean") {
            deep = target;
            i++;
        }

        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    copy = options[name];
                    if (name === "__proto__" || target === copy) continue;
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                        src = target[name];
                        if (copyIsArray && !Array.isArray(src)) {
                            clone = [];
                        } else if (!copyIsArray && !jQuery.isPlainObject(src)) {
                            clone = {};
                        } else {
                            clone = src;
                        }
                        copyIsArray = false;
                        target[name] = jQuery.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };

    jQuery.extend({
        expando: `jQuery${version}${Math.random()}`.replace(/\D/g, ""),
        isReady: true,
        error(msg) { throw new Error(msg); },
        noop() {},
        isPlainObject(obj) {
            const proto = Object.getPrototypeOf(obj);
            return proto === null || proto.constructor === Object;
        },
        isEmptyObject(obj) {
            for (let name in obj) { return false; }
            return true;
        },
        globalEval(code, options, doc) {
            const script = (doc || document).createElement("script");
            script.text = code;
            if (options && options.nonce) {
                script.setAttribute("nonce", options.nonce);
            }
            document.head.appendChild(script).parentNode.removeChild(script);
        },
        each(obj, callback) {
            let length, i = 0;
            if (jQuery.isArrayLike(obj)) {
                length = obj.length;
                for (; i < length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) break;
                }
            } else {
                for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) break;
                }
            }
            return obj;
        },
        map(elems, callback, arg) {
            let length, value, i = 0, ret = [];
            if (jQuery.isArrayLike(elems)) {
                length = elems.length;
                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else {
                for (i in elems) {
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            }
            return Array.prototype.concat.apply([], ret);
        },
        support: {},
        isFunction(obj) {
            return typeof obj === "function" && typeof obj.nodeType !== "number";
        },
        isWindow(obj) {
            return obj != null && obj === obj.window;
        },
        isArrayLike(obj) {
            const length = !!obj && "length" in obj && obj.length, type = jQuery.type(obj);
            if (jQuery.isFunction(obj) || jQuery.isWindow(obj)) {
                return false;
            }
            return type === "array" || length === 0 ||
                typeof length === "number" && length > 0 && (length - 1) in obj;
        },
        type(obj) {
            if (obj == null) {
                return obj + "";
            }
            return typeof obj === "object" || typeof obj === "function" ?
                class2type[ toString.call(obj) ] || "object" : typeof obj;
        }
    });

    const class2type = [];
    const toString = class2type.toString;

    if (typeof Symbol === "function") {
        jQuery.fn[Symbol.iterator] = Array.prototype[Symbol.iterator];
    }

    jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(_, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    const rootjQuery = jQuery(document);
    const init = jQuery.fn.init = function(selector, context, root) {
        if (!selector) { return this; }
        root = root || rootjQuery;
        if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
                match = [null, selector, null];
            } else {
                match = rquickExpr.exec(selector);
            }
            if (match && (match[1] || !context)) {
                if (match[1]) {
                    context = context instanceof jQuery ? context[0] : context;
                    jQuery.merge(this, jQuery.parseHTML(
                        match[1],
                        context && context.nodeType ? context.ownerDocument || context : document,
                        true
                    ));
                    if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                        for (match in context) {
                            if (jQuery.isFunction(this[match])) {
                                this[match](context[match]);
                            } else {
                                this.attr(match, context[match]);
                            }
                        }
                    }
                    return this;
                } else {
                    elem = document.getElementById(match[2]);
                    if (elem) {
                        this[0] = elem;
                        this.length = 1;
                    }
                    return this;
                }
            } else if (!context || context.jquery) {
                return (context || root).find(selector);
            } else {
                return this.constructor(context).find(selector);
            }
        } else if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
        } else if (jQuery.isFunction(selector)) {
            return root.ready !== undefined ?
                root.ready(selector) :
                selector(jQuery);
        }
        return jQuery.makeArray(selector, this);
    };

    init.prototype = jQuery.fn;

    return jQuery;
});
