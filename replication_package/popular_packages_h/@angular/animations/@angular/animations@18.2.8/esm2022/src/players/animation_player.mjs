/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * An empty programmatic controller for reusable animations.
 * Used internally when animations are disabled, to avoid
 * checking for the null case when an animation player is expected.
 *
 * @see {@link animate}
 * @see {@link AnimationPlayer}
 *
 * @publicApi
 */
export class NoopAnimationPlayer {
    constructor(duration = 0, delay = 0) {
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._originalOnDoneFns = [];
        this._originalOnStartFns = [];
        this._started = false;
        this._destroyed = false;
        this._finished = false;
        this._position = 0;
        this.parentPlayer = null;
        this.totalTime = duration + delay;
    }
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach((fn) => fn());
            this._onDoneFns = [];
        }
    }
    onStart(fn) {
        this._originalOnStartFns.push(fn);
        this._onStartFns.push(fn);
    }
    onDone(fn) {
        this._originalOnDoneFns.push(fn);
        this._onDoneFns.push(fn);
    }
    onDestroy(fn) {
        this._onDestroyFns.push(fn);
    }
    hasStarted() {
        return this._started;
    }
    init() { }
    play() {
        if (!this.hasStarted()) {
            this._onStart();
            this.triggerMicrotask();
        }
        this._started = true;
    }
    /** @internal */
    triggerMicrotask() {
        queueMicrotask(() => this._onFinish());
    }
    _onStart() {
        this._onStartFns.forEach((fn) => fn());
        this._onStartFns = [];
    }
    pause() { }
    restart() { }
    finish() {
        this._onFinish();
    }
    destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            if (!this.hasStarted()) {
                this._onStart();
            }
            this.finish();
            this._onDestroyFns.forEach((fn) => fn());
            this._onDestroyFns = [];
        }
    }
    reset() {
        this._started = false;
        this._finished = false;
        this._onStartFns = this._originalOnStartFns;
        this._onDoneFns = this._originalOnDoneFns;
    }
    setPosition(position) {
        this._position = this.totalTime ? position * this.totalTime : 1;
    }
    getPosition() {
        return this.totalTime ? this._position / this.totalTime : 1;
    }
    /** @internal */
    triggerCallback(phaseName) {
        const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach((fn) => fn());
        methods.length = 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3BsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvc3JjL3BsYXllcnMvYW5pbWF0aW9uX3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUF1R0g7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQVk5QixZQUFZLFdBQW1CLENBQUMsRUFBRSxRQUFnQixDQUFDO1FBWDNDLGVBQVUsR0FBZSxFQUFFLENBQUM7UUFDNUIsZ0JBQVcsR0FBZSxFQUFFLENBQUM7UUFDN0Isa0JBQWEsR0FBZSxFQUFFLENBQUM7UUFDL0IsdUJBQWtCLEdBQWUsRUFBRSxDQUFDO1FBQ3BDLHdCQUFtQixHQUFlLEVBQUUsQ0FBQztRQUNyQyxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsaUJBQVksR0FBMkIsSUFBSSxDQUFDO1FBR2pELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUNwQyxDQUFDO0lBQ08sU0FBUztRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDdkIsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLENBQUMsRUFBYztRQUNwQixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDRCxNQUFNLENBQUMsRUFBYztRQUNuQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxTQUFTLENBQUMsRUFBYztRQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ0QsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxLQUFVLENBQUM7SUFDZixJQUFJO1FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixnQkFBZ0I7UUFDZCxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVPLFFBQVE7UUFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsS0FBSyxLQUFVLENBQUM7SUFDaEIsT0FBTyxLQUFVLENBQUM7SUFDbEIsTUFBTTtRQUNKLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBQ0QsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEIsQ0FBQztZQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUM7SUFDSCxDQUFDO0lBQ0QsS0FBSztRQUNILElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQzVDLENBQUM7SUFDRCxXQUFXLENBQUMsUUFBZ0I7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGVBQWUsQ0FBQyxTQUFpQjtRQUMvQixNQUFNLE9BQU8sR0FBRyxTQUFTLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFByb3ZpZGVzIHByb2dyYW1tYXRpYyBjb250cm9sIG9mIGEgcmV1c2FibGUgYW5pbWF0aW9uIHNlcXVlbmNlLFxuICogYnVpbHQgdXNpbmcgdGhlIDxjb2RlPltBbmltYXRpb25CdWlsZGVyLmJ1aWxkXShhcGkvYW5pbWF0aW9ucy9BbmltYXRpb25CdWlsZGVyI2J1aWxkKSgpPC9jb2RlPlxuICogbWV0aG9kIHdoaWNoIHJldHVybnMgYW4gYEFuaW1hdGlvbkZhY3RvcnlgLCB3aG9zZVxuICogPGNvZGU+W2NyZWF0ZV0oYXBpL2FuaW1hdGlvbnMvQW5pbWF0aW9uRmFjdG9yeSNjcmVhdGUpKCk8L2NvZGU+IG1ldGhvZCBpbnN0YW50aWF0ZXMgYW5kXG4gKiBpbml0aWFsaXplcyB0aGlzIGludGVyZmFjZS5cbiAqXG4gKiBAc2VlIHtAbGluayBBbmltYXRpb25CdWlsZGVyfVxuICogQHNlZSB7QGxpbmsgQW5pbWF0aW9uRmFjdG9yeX1cbiAqIEBzZWUge0BsaW5rIGFuaW1hdGV9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblBsYXllciB7XG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGNhbGxiYWNrIHRvIGludm9rZSB3aGVuIHRoZSBhbmltYXRpb24gZmluaXNoZXMuXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAqIEBzZWUge0BsaW5rICNmaW5pc2h9XG4gICAqL1xuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkO1xuICAvKipcbiAgICogUHJvdmlkZXMgYSBjYWxsYmFjayB0byBpbnZva2Ugd2hlbiB0aGUgYW5pbWF0aW9uIHN0YXJ0cy5cbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICogQHNlZSB7QGxpbmsgI3BsYXl9XG4gICAqL1xuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZDtcbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgY2FsbGJhY2sgdG8gaW52b2tlIGFmdGVyIHRoZSBhbmltYXRpb24gaXMgZGVzdHJveWVkLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgKiBAc2VlIHtAbGluayAjZGVzdHJveX1cbiAgICogQHNlZSB7QGxpbmsgI2JlZm9yZURlc3Ryb3l9XG4gICAqL1xuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkO1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFuaW1hdGlvbi5cbiAgICovXG4gIGluaXQoKTogdm9pZDtcbiAgLyoqXG4gICAqIFJlcG9ydHMgd2hldGhlciB0aGUgYW5pbWF0aW9uIGhhcyBzdGFydGVkLlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBhbmltYXRpb24gaGFzIHN0YXJ0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGhhc1N0YXJ0ZWQoKTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFJ1bnMgdGhlIGFuaW1hdGlvbiwgaW52b2tpbmcgdGhlIGBvblN0YXJ0KClgIGNhbGxiYWNrLlxuICAgKi9cbiAgcGxheSgpOiB2b2lkO1xuICAvKipcbiAgICogUGF1c2VzIHRoZSBhbmltYXRpb24uXG4gICAqL1xuICBwYXVzZSgpOiB2b2lkO1xuICAvKipcbiAgICogUmVzdGFydHMgdGhlIHBhdXNlZCBhbmltYXRpb24uXG4gICAqL1xuICByZXN0YXJ0KCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBFbmRzIHRoZSBhbmltYXRpb24sIGludm9raW5nIHRoZSBgb25Eb25lKClgIGNhbGxiYWNrLlxuICAgKi9cbiAgZmluaXNoKCk6IHZvaWQ7XG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgYW5pbWF0aW9uLCBhZnRlciBpbnZva2luZyB0aGUgYGJlZm9yZURlc3Ryb3koKWAgY2FsbGJhY2suXG4gICAqIENhbGxzIHRoZSBgb25EZXN0cm95KClgIGNhbGxiYWNrIHdoZW4gZGVzdHJ1Y3Rpb24gaXMgY29tcGxldGVkLlxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkO1xuICAvKipcbiAgICogUmVzZXRzIHRoZSBhbmltYXRpb24gdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gICAqL1xuICByZXNldCgpOiB2b2lkO1xuICAvKipcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGFuaW1hdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIEEgMC1iYXNlZCBvZmZzZXQgaW50byB0aGUgZHVyYXRpb24sIGluIG1pbGxpc2Vjb25kcy5cbiAgICovXG4gIHNldFBvc2l0aW9uKHBvc2l0aW9uOiBudW1iZXIpOiB2b2lkO1xuICAvKipcbiAgICogUmVwb3J0cyB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgYW5pbWF0aW9uLlxuICAgKiBAcmV0dXJucyBBIDAtYmFzZWQgb2Zmc2V0IGludG8gdGhlIGR1cmF0aW9uLCBpbiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICBnZXRQb3NpdGlvbigpOiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgcGFyZW50IG9mIHRoaXMgcGxheWVyLCBpZiBhbnkuXG4gICAqL1xuICBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllciB8IG51bGw7XG4gIC8qKlxuICAgKiBUaGUgdG90YWwgcnVuIHRpbWUgb2YgdGhlIGFuaW1hdGlvbiwgaW4gbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgcmVhZG9ubHkgdG90YWxUaW1lOiBudW1iZXI7XG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGNhbGxiYWNrIHRvIGludm9rZSBiZWZvcmUgdGhlIGFuaW1hdGlvbiBpcyBkZXN0cm95ZWQuXG4gICAqL1xuICBiZWZvcmVEZXN0cm95PzogKCkgPT4gYW55O1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIEludGVybmFsXG4gICAqL1xuICB0cmlnZ2VyQ2FsbGJhY2s/OiAocGhhc2VOYW1lOiBzdHJpbmcpID0+IHZvaWQ7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICogSW50ZXJuYWxcbiAgICovXG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBbiBlbXB0eSBwcm9ncmFtbWF0aWMgY29udHJvbGxlciBmb3IgcmV1c2FibGUgYW5pbWF0aW9ucy5cbiAqIFVzZWQgaW50ZXJuYWxseSB3aGVuIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkLCB0byBhdm9pZFxuICogY2hlY2tpbmcgZm9yIHRoZSBudWxsIGNhc2Ugd2hlbiBhbiBhbmltYXRpb24gcGxheWVyIGlzIGV4cGVjdGVkLlxuICpcbiAqIEBzZWUge0BsaW5rIGFuaW1hdGV9XG4gKiBAc2VlIHtAbGluayBBbmltYXRpb25QbGF5ZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgTm9vcEFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX29uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vblN0YXJ0Rm5zOiBGdW5jdGlvbltdID0gW107XG4gIHByaXZhdGUgX29uRGVzdHJveUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vcmlnaW5hbE9uRG9uZUZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vcmlnaW5hbE9uU3RhcnRGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfcG9zaXRpb24gPSAwO1xuICBwdWJsaWMgcGFyZW50UGxheWVyOiBBbmltYXRpb25QbGF5ZXIgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIHJlYWRvbmx5IHRvdGFsVGltZTogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihkdXJhdGlvbjogbnVtYmVyID0gMCwgZGVsYXk6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLnRvdGFsVGltZSA9IGR1cmF0aW9uICsgZGVsYXk7XG4gIH1cbiAgcHJpdmF0ZSBfb25GaW5pc2goKSB7XG4gICAgaWYgKCF0aGlzLl9maW5pc2hlZCkge1xuICAgICAgdGhpcy5fZmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fb25Eb25lRm5zLmZvckVhY2goKGZuKSA9PiBmbigpKTtcbiAgICAgIHRoaXMuX29uRG9uZUZucyA9IFtdO1xuICAgIH1cbiAgfVxuICBvblN0YXJ0KGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb3JpZ2luYWxPblN0YXJ0Rm5zLnB1c2goZm4pO1xuICAgIHRoaXMuX29uU3RhcnRGbnMucHVzaChmbik7XG4gIH1cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb3JpZ2luYWxPbkRvbmVGbnMucHVzaChmbik7XG4gICAgdGhpcy5fb25Eb25lRm5zLnB1c2goZm4pO1xuICB9XG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uRGVzdHJveUZucy5wdXNoKGZuKTtcbiAgfVxuICBoYXNTdGFydGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdGFydGVkO1xuICB9XG4gIGluaXQoKTogdm9pZCB7fVxuICBwbGF5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHRoaXMuX29uU3RhcnQoKTtcbiAgICAgIHRoaXMudHJpZ2dlck1pY3JvdGFzaygpO1xuICAgIH1cbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlck1pY3JvdGFzaygpIHtcbiAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB0aGlzLl9vbkZpbmlzaCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX29uU3RhcnQoKSB7XG4gICAgdGhpcy5fb25TdGFydEZucy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG4gICAgdGhpcy5fb25TdGFydEZucyA9IFtdO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7fVxuICByZXN0YXJ0KCk6IHZvaWQge31cbiAgZmluaXNoKCk6IHZvaWQge1xuICAgIHRoaXMuX29uRmluaXNoKCk7XG4gIH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgICAgdGhpcy5fb25TdGFydCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5maW5pc2goKTtcbiAgICAgIHRoaXMuX29uRGVzdHJveUZucy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG4gICAgICB0aGlzLl9vbkRlc3Ryb3lGbnMgPSBbXTtcbiAgICB9XG4gIH1cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZpbmlzaGVkID0gZmFsc2U7XG4gICAgdGhpcy5fb25TdGFydEZucyA9IHRoaXMuX29yaWdpbmFsT25TdGFydEZucztcbiAgICB0aGlzLl9vbkRvbmVGbnMgPSB0aGlzLl9vcmlnaW5hbE9uRG9uZUZucztcbiAgfVxuICBzZXRQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fcG9zaXRpb24gPSB0aGlzLnRvdGFsVGltZSA/IHBvc2l0aW9uICogdGhpcy50b3RhbFRpbWUgOiAxO1xuICB9XG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudG90YWxUaW1lID8gdGhpcy5fcG9zaXRpb24gLyB0aGlzLnRvdGFsVGltZSA6IDE7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBwaGFzZU5hbWUgPT0gJ3N0YXJ0JyA/IHRoaXMuX29uU3RhcnRGbnMgOiB0aGlzLl9vbkRvbmVGbnM7XG4gICAgbWV0aG9kcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG59XG4iXX0=