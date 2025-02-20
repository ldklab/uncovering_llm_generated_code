/**
 * @license Angular v9.1.13
 * (c) 2010-2020 Google LLC. https://angular.io/
 * License: MIT
 */

// UMD pattern to support CommonJS, AMD, and global context
(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports); // CommonJS
    } else if (typeof define === 'function' && define.amd) {
        define('@angular/animations', ['exports'], factory); // AMD
    } else {
        factory((global.ng = global.ng || {}, global.ng.animations = {})); // Global
    }
}(this, (function (exports) {
    'use strict';

    // Constants and Helper Functions
    const AUTO_STYLE = '*';
    const ɵPRE_STYLE = '!';

    function scheduleMicroTask(cb) {
        Promise.resolve(null).then(cb);
    }

    // Animation Builder and Factory Classes
    class AnimationBuilder {
        constructor() {}
    }

    class AnimationFactory {
        constructor() {}
    }

    // Animation Player Classes
    class NoopAnimationPlayer {
        constructor(duration = 0, delay = 0) {
            this._onDoneFns = [];
            this._onStartFns = [];
            this._onDestroyFns = [];
            this._started = false;
            this._destroyed = false;
            this._finished = false;
            this.parentPlayer = null;
            this.totalTime = duration + delay;
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
        init() { }
        play() {
            if (!this.hasStarted()) {
                this._onStart();
                this.triggerMicrotask();
            }
            this._started = true;
        }

        triggerMicrotask() {
            scheduleMicroTask(() => this._onFinish());
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
            this._onDoneFns = [];
            this._onStartFns = [];
            this._finished = false;
            this._started = false;
            this._destroyed = false;
            this._onDestroyFns = [];
            this.parentPlayer = null;
            this.totalTime = 0;
            this.players = _players;

            let doneCount = 0;
            let destroyCount = 0;
            let startCount = 0;
            const total = this.players.length;
            
            if (total === 0) {
                scheduleMicroTask(() => this._onFinish());
            } else {
                this.players.forEach(player => {
                    player.onDone(() => { if (++doneCount === total) this._onFinish(); });
                    player.onDestroy(() => { if (++destroyCount === total) this._onDestroy(); });
                    player.onStart(() => { if (++startCount === total) this._onStart(); });
                });
            }

            this.totalTime = this.players.reduce((time, player) => Math.max(time, player.totalTime), 0);
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

    // Expose the API for use
    Object.defineProperty(exports, '__esModule', { value: true });

    // Export Constants, Classes, and Functions
    Object.assign(exports, {
        AUTO_STYLE,
        AnimationBuilder,
        AnimationFactory,
        NoopAnimationPlayer,
        AnimationGroupPlayer,
        ɵPRE_STYLE,
        animate,
        animateChild,
        animation,
        group,
        keyframes,
        query,
        sequence,
        stagger,
        state,
        style,
        transition,
        trigger,
        useAnimation
    });

})));
