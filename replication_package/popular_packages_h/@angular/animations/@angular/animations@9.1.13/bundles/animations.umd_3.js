/**
 * @license Angular v9.1.13
 * (c) 2010-2020 Google LLC. https://angular.io/
 * License: MIT
 */
(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define('@angular/animations', ['exports'], factory);
    } else {
        // Global variable
        (root = root || self, factory((root.ng = root.ng || {}, root.ng.animations = {})));
    }
}(this, function (exports) {
    'use strict';

    var AUTO_STYLE = '*'; // A constant for automatic styling
    var AnimationBuilder = function () {}; // AnimationBuilder class
    var AnimationFactory = function () {}; // AnimationFactory class
    var ɵPRE_STYLE = '!'; // Internal use

    // Animation functions
    function animate(timings, styles) {
        return { type: 4, timings: timings, styles: styles || null };
    }

    function group(steps, options) {
        return { type: 3, steps: steps, options: options || null };
    }

    function sequence(steps, options) {
        return { type: 2, steps: steps, options: options || null };
    }

    function style(tokens) {
        return { type: 6, styles: tokens, offset: null };
    }

    function state(name, styles, options) {
        return { type: 0, name: name, styles: styles, options: options };
    }

    function keyframes(steps) {
        return { type: 5, steps: steps };
    }

    function transition(stateChangeExpr, steps, options) {
        return {
            type: 1,
            expr: stateChangeExpr,
            animation: steps,
            options: options || null
        };
    }

    function trigger(name, definitions) {
        return {
            type: 7,
            name: name,
            definitions: definitions,
            options: {}
        };
    }

    function animateChild(options) {
        return { type: 9, options: options || null };
    }

    function useAnimation(animation, options) {
        return {
            type: 10,
            animation: animation,
            options: options || null
        };
    }

    function query(selector, animation, options) {
        return {
            type: 11,
            selector: selector,
            animation: animation,
            options: options || null
        };
    }

    function stagger(timings, animation) {
        return {
            type: 12,
            timings: timings,
            animation: animation
        };
    }

    function animation(steps, options) {
        return {
            type: 8,
            animation: steps,
            options: options || null
        };
    }

    function scheduleMicroTask(cb) {
        Promise.resolve(null).then(cb);
    }

    // Exporting
    exports.AUTO_STYLE = AUTO_STYLE;
    exports.AnimationBuilder = AnimationBuilder;
    exports.AnimationFactory = AnimationFactory;
    exports.NoopAnimationPlayer = (function () {
        function NoopAnimationPlayer(duration, delay) {
            this.totalTime = duration + delay;
        }
        return NoopAnimationPlayer;
    })();
    exports.animate = animate;
    exports.animateChild = animateChild;
    exports.animation = animation;
    exports.group = group;
    exports.keyframes = keyframes;
    exports.query = query;
    exports.sequence = sequence;
    exports.stagger = stagger;
    exports.state = state;
    exports.style = style;
    exports.transition = transition;
    exports.trigger = trigger;
    exports.useAnimation = useAnimation;
    exports.ɵAnimationGroupPlayer = (function () {});
    exports.ɵPRE_STYLE = ɵPRE_STYLE;

    Object.defineProperty(exports, '__esModule', { value: true });
}));
