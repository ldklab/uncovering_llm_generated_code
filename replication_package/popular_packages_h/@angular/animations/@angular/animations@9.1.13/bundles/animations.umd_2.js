(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports); // CommonJS/Node.js
    } else if (typeof define === 'function' && define.amd) {
        define('@angular/animations', ['exports'], factory); // AMD/RequireJS
    } else {
        global = global || self;
        factory(global.ng = global.ng || {}, global.ng.animations = {}); // Global Browser
    }
}(this, (function (exports) {
    'use strict';

    // AnimationBuilder class for creating animations
    class AnimationBuilder {}
    // AnimationFactory class for producing AnimationPlayer instances
    class AnimationFactory {}

    // Constants and utility functions for defining animations.
    const AUTO_STYLE = '*';
    function trigger(name, definitions) {
        return { type: 7 /* Trigger */, name: name, definitions: definitions, options: {} };
    }
    function animate(timings, styles = null) {
        return { type: 4 /* Animate */, styles: styles, timings: timings };
    }
    function group(steps, options = null) {
        return { type: 3 /* Group */, steps: steps, options: options };
    }
    function sequence(steps, options = null) {
        return { type: 2 /* Sequence */, steps: steps, options: options };
    }
    function style(tokens) {
        return { type: 6 /* Style */, styles: tokens, offset: null };
    }
    function state(name, styles, options) {
        return { type: 0 /* State */, name: name, styles: styles, options: options };
    }
    function keyframes(steps) {
        return { type: 5 /* Keyframes */, steps: steps };
    }
    function transition(stateChangeExpr, steps, options = null) {
        return { type: 1 /* Transition */, expr: stateChangeExpr, animation: steps, options: options };
    }
    function animation(steps, options = null) {
        return { type: 8 /* Reference */, animation: steps, options: options };
    }
    function animateChild(options = null) {
        return { type: 9 /* AnimateChild */, options: options };
    }
    function useAnimation(animation, options = null) {
        return { type: 10 /* AnimateRef */, animation: animation, options: options };
    }
    function query(selector, animation, options = null) {
        return { type: 11 /* Query */, selector: selector, animation: animation, options: options };
    }
    function stagger(timings, animation) {
        return { type: 12 /* Stagger */, timings: timings, animation: animation };
    }

    // No-op animation player for disabled animations
    class NoopAnimationPlayer {
        constructor(duration = 0, delay = 0) {
            this._onDoneFns = [];
            this._onStartFns = [];
            this._onDestroyFns = [];
            this._started = false;
            this._finished = false;
            this.totalTime = duration + delay;
        }
        play() {
            if (!this._started) {
                this._started = true;
                this.triggerCallbacks('start');
                this.finish();
            }
        }
        finish() {
            if (!this._finished) {
                this._finished = true;
                this.triggerCallbacks('done');
            }
        }
        triggerCallbacks(phaseName) {
            const callbacks = phaseName === 'start' ? this._onStartFns : this._onDoneFns;
            callbacks.forEach(fn => fn());
        }
    }

    // Group animation player for managing multiple animations
    class AnimationGroupPlayer {
        constructor(players) {
            this.players = players;
            this._finished = false;
            this._onDoneFns = [];
            this.totalTime = Math.max(...players.map(p => p.totalTime));
            players.forEach(player => player.onDone(() => this.checkFinished()));
        }
        checkFinished() {
            if (!this._finished && this.players.every(p => p._finished)) {
                this._finished = true;
                this._onDoneFns.forEach(fn => fn());
            }
        }
        onDone(fn) {
            this._onDoneFns.push(fn);
        }
        play() {
            this.players.forEach(player => player.play());
        }
    }

    // Export functions and classes
    exports.AUTO_STYLE = AUTO_STYLE;
    exports.AnimationBuilder = AnimationBuilder;
    exports.AnimationFactory = AnimationFactory;
    exports.NoopAnimationPlayer = NoopAnimationPlayer;
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
    exports.AnimationGroupPlayer = AnimationGroupPlayer;

    Object.defineProperty(exports, '__esModule', { value: true });
})));
