(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(exports);  // Export for Node.js using CommonJS
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);  // Export for AMD
    } else {
        factory((root.ng = root.ng || {}, root.ng.animations = {}));  // Export as global
    }
}(typeof self !== 'undefined' ? self : this, function (exports) {
    'use strict';

    const AUTO_STYLE = '*';

    class AnimationBuilder {};

    class AnimationFactory {};

    class NoopAnimationPlayer {
        constructor(duration = 0, delay = 0) {
            this.totalTime = duration + delay;
            this._onDoneFns = [];
            this._onStartFns = [];
            this._onDestroyFns = [];
            this._started = false;
            this._destroyed = false;
            this._finished = false;
            this.parentPlayer = null;
        }
        _onFinish() {
            if (!this._finished) {
                this._finished = true;
                this._onDoneFns.forEach(fn => fn());
                this._onDoneFns = [];
            }
        }
        onStart(fn) { this._onStartFns.push(fn); }
        onDone(fn) { this._onDoneFns.push(fn); }
        onDestroy(fn) { this._onDestroyFns.push(fn); }
        hasStarted() { return this._started; }
        init() {}
        play() {
            if (!this.hasStarted()) {
                this._onStart();
                this.triggerMicrotask();
            }
            this._started = true;
        }
        triggerMicrotask() {
            Promise.resolve(null).then(() => this._onFinish());
        }
        _onStart() {
            this._onStartFns.forEach(fn => fn());
            this._onStartFns = [];
        }
        pause() {}
        restart() {}
        finish() { this._onFinish(); }
        destroy() {
            if (!this._destroyed) {
                this._destroyed = true;
                if (!this.hasStarted()) {
                    this._onStart();
                }
                this.finish();
                this._onDestroyFns.forEach(fn => fn());
                this._onDestroyFns = [];
            }
        }
        reset() {}
        setPosition(position) {}
        getPosition() { return 0; }
        triggerCallback(phaseName) {
            const methods = phaseName === 'start' ? this._onStartFns : this._onDoneFns;
            methods.forEach(fn => fn());
            methods.length = 0;
        }
    }

    class AnimationGroupPlayer {
        constructor(_players) {
            let doneCount = 0;
            let destroyCount = 0;
            let startCount = 0;
            const total = this.players.length;
            this.players = _players;
            this.totalTime = this.players.reduce((time, player) => Math.max(time, player.totalTime), 0);
            this._onDoneFns = [];
            this._onStartFns = [];
            this._onDestroyFns = [];
            this._finished = false;
            this._started = false;
            this._destroyed = false;
            this.parentPlayer = null;
            if (total === 0) {
                Promise.resolve(null).then(() => this._onFinish());
            } else {
                this.players.forEach(player => {
                    player.onDone(() => {
                        if (++doneCount === total) {
                            this._onFinish();
                        }
                    });
                    player.onDestroy(() => {
                        if (++destroyCount === total) {
                            this._onDestroy();
                        }
                    });
                    player.onStart(() => {
                        if (++startCount === total) {
                            this._onStart();
                        }
                    });
                });
            }
        }
        _onFinish() {
            if (!this._finished) {
                this._finished = true;
                this._onDoneFns.forEach(fn => fn());
                this._onDoneFns = [];
            }
        }
        init() { this.players.forEach(player => player.init()); }
        onStart(fn) { this._onStartFns.push(fn); }
        _onStart() {
            if (!this.hasStarted()) {
                this._started = true;
                this._onStartFns.forEach(fn => fn());
                this._onStartFns = [];
            }
        }
        onDone(fn) { this._onDoneFns.push(fn); }
        onDestroy(fn) { this._onDestroyFns.push(fn); }
        hasStarted() { return this._started; }
        play() {
            if (!this.parentPlayer) {
                this.init();
            }
            this._onStart();
            this.players.forEach(player => player.play());
        }
        pause() { this.players.forEach(player => player.pause()); }
        restart() { this.players.forEach(player => player.restart()); }
        finish() {
            this._onFinish();
            this.players.forEach(player => player.finish());
        }
        destroy() { this._onDestroy(); }
        _onDestroy() {
            if (!this._destroyed) {
                this._destroyed = true;
                this._onFinish();
                this.players.forEach(player => player.destroy());
                this._onDestroyFns.forEach(fn => fn());
                this._onDestroyFns = [];
            }
        }
        reset() {
            this.players.forEach(player => player.reset());
            this._destroyed = false;
            this._finished = false;
            this._started = false;
        }
        setPosition(p) {
            const timeAtPosition = p * this.totalTime;
            this.players.forEach(player => {
                const position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
                player.setPosition(position);
            });
        }
        getPosition() {
            let min = 0;
            this.players.forEach(player => {
                const p = player.getPosition();
                min = Math.min(p, min);
            });
            return min;
        }
        beforeDestroy() {
            this.players.forEach(player => {
                if (player.beforeDestroy) {
                    player.beforeDestroy();
                }
            });
        }
        triggerCallback(phaseName) {
            const methods = phaseName === 'start' ? this._onStartFns : this._onDoneFns;
            methods.forEach(fn => fn());
            methods.length = 0;
        }
    }

    function animate(timings, styles = null) {
        return { type: 'animate', styles, timings };
    }

    function group(steps, options = null) {
        return { type: 'group', steps, options };
    }

    function sequence(steps, options = null) {
        return { type: 'sequence', steps, options };
    }

    function style(tokens) {
        return { type: 'style', styles: tokens, offset: null };
    }

    function state(name, styles, options) {
        return { type: 'state', name, styles, options };
    }

    function keyframes(steps) {
        return { type: 'keyframes', steps };
    }

    function transition(stateChangeExpr, steps, options = null) {
        return { type: 'transition', expr: stateChangeExpr, animation: steps, options: options };
    }

    function animation(steps, options = null) {
        return { type: 'animation', animation: steps, options: options };
    }

    function query(selector, animation, options = null) {
        return { type: 'query', selector: selector, animation: animation, options: options };
    }

    function stagger(timings, animation) {
        return { type: 'stagger', timings: timings, animation: animation };
    }

    function trigger(name, definitions) {
        return { type: 'trigger', name: name, definitions: definitions, options: {} };
    }

    function animateChild(options = null) {
        return { type: 'animateChild', options: options };
    }

    function useAnimation(animation, options = null) {
        return { type: 'useAnimation', animation: animation, options: options };
    }

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

    Object.defineProperty(exports, '__esModule', { value: true });

}));
