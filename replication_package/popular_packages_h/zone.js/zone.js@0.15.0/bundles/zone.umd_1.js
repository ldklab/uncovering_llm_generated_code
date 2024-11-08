'use strict';

(function(factory) {
    typeof define === 'function' && define.amd ? define(factory) : factory();
})(function() {
    'use strict';
    
    var global = globalThis;

    function createSymbol(name) {
        var prefix = global['__Zone_symbol_prefix'] || '__zone_symbol__';
        return prefix + name;
    }

    function setupZone() {
        var performance = global['performance'];

        function mark(name) {
            if (performance && performance['mark']) {
                performance['mark'](name);
            }
        }

        function measure(name, label) {
            if (performance && performance['measure']) {
                performance['measure'](name, label);
            }
        }

        mark('Zone');

        class ZoneImplementation {
            constructor(parent, zoneSpec) {
                this._parent = parent;
                this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
                this._properties = zoneSpec && zoneSpec.properties ? zoneSpec.properties : {};
                this._delegate = new ZoneDelegate(this, parent ? parent._delegate : null, zoneSpec);
            }

            static assertZonePatched() {
                if (global['Promise'] !== zonePatches['ZoneAwarePromise']) {
                    throw new Error('Zone.js detected that ZoneAwarePromise has been overwritten.');
                }
            }

            static get root() {
                let zone = this.current;
                while (zone.parent) {
                    zone = zone.parent;
                }
                return zone;
            }

            static get current() {
                return currentZoneFrame.zone;
            }

            static get currentTask() {
                return currentTask;
            }

            // Load a patch, checking for duplicates
            static loadPatch(name, fn, ignoreDuplicate = false) {
                if (zonePatches.hasOwnProperty(name)) {
                    const checkDuplicate = global[createSymbol('forceDuplicateZoneCheck')] === true;
                    if (!ignoreDuplicate && checkDuplicate) {
                        throw Error('Already loaded patch: ' + name);
                    }
                } else if (!global['__Zone_disable_' + name]) {
                    const perfName = 'Zone:' + name;
                    mark(perfName);
                    zonePatches[name] = fn(global, this, api);
                    measure(perfName, perfName);
                }
            }

            get parent() {
                return this._parent;
            }

            get name() {
                return this._name;
            }

            get(key) {
                const zone = this.getZoneWith(key);
                return zone ? zone._properties[key] : undefined;
            }

            getZoneWith(key) {
                let current = this;
                while (current) {
                    if (current._properties.hasOwnProperty(key)) {
                        return current;
                    }
                    current = current._parent;
                }
                return null;
            }

            fork(zoneSpec) {
                if (!zoneSpec) throw new Error('ZoneSpec required!');
                return this._delegate.fork(this, zoneSpec);
            }

            wrap(callback, source) {
                if (typeof callback !== 'function') {
                    throw new Error('Expecting function got: ' + callback);
                }
                const _callback = this._delegate.intercept(this, callback, source);
                const zone = this;
                return function() {
                    return zone.runGuarded(_callback, this, arguments, source);
                };
            }

            run(callback, applyThis, applyArgs, source) {
                currentZoneFrame = { parent: currentZoneFrame, zone: this };
                try {
                    return this._delegate.invoke(this, callback, applyThis, applyArgs, source);
                } finally {
                    currentZoneFrame = currentZoneFrame.parent;
                }
            }

            runGuarded(callback, applyThis = null, applyArgs, source) {
                currentZoneFrame = { parent: currentZoneFrame, zone: this };
                try {
                    return this._delegate.invoke(this, callback, applyThis, applyArgs, source);
                } catch (error) {
                    if (this._delegate.handleError(this, error)) {
                        throw error;
                    }
                } finally {
                    currentZoneFrame = currentZoneFrame.parent;
                }
            }

            runTask(task, applyThis, applyArgs) {
                if (task.zone != this) {
                    throw new Error('A task can only be run in the zone of creation!');
                }
                const zoneTask = task;
                const type = task.type, data = task.data || {}, isPeriodic = data.isPeriodic || false, isRefreshable = data.isRefreshable || false;

                if (task.state === notScheduled && (type === eventTask || type === macroTask)) {
                    return;
                }

                const reEntryGuard = task.state != running;
                if (reEntryGuard) zoneTask.transitionTo(running, scheduled);

                const previousTask = currentTask;
                currentTask = zoneTask;
                currentZoneFrame = { parent: currentZoneFrame, zone: this };

                try {
                    if (type === macroTask && task.data && !isPeriodic && !isRefreshable) {
                        task.cancelFn = undefined;
                    }
                    try {
                        return this._delegate.invokeTask(this, zoneTask, applyThis, applyArgs);
                    } catch (error) {
                        if (this._delegate.handleError(this, error)) {
                            throw error;
                        }
                    }
                } finally {
                    const state = task.state;
                    if (state !== notScheduled && state !== unknown) {
                        if (type === eventTask || isPeriodic || (isRefreshable && state === scheduling)) {
                            reEntryGuard && zoneTask.transitionTo(scheduled, running, scheduling);
                        } else {
                            const zoneDelegates = zoneTask._zoneDelegates;
                            this.updateTaskCount(zoneTask, -1);
                            reEntryGuard && zoneTask.transitionTo(notScheduled, running, notScheduled);
                            if (isRefreshable) {
                                zoneTask._zoneDelegates = zoneDelegates;
                            }
                        }
                    }
                    currentZoneFrame = currentZoneFrame.parent;
                    currentTask = previousTask;
                }
            }

            scheduleTask(task) {
                if (task.zone && task.zone !== this) {
                    let newZone = this;
                    while (newZone) {
                        if (newZone === task.zone) {
                            throw Error(`Cannot reschedule task to ${this.name} which is a descendant of the original zone ${task.zone.name}`);
                        }
                        newZone = newZone.parent;
                    }
                }
                task.transitionTo(scheduling, notScheduled);
                const zoneDelegates = [];
                task._zoneDelegates = zoneDelegates;
                task._zone = this;
                try {
                    task = this._delegate.scheduleTask(this, task);
                } catch (err) {
                    task.transitionTo(unknown, scheduling, notScheduled);
                    this._delegate.handleError(this, err);
                    throw err;
                }
                if (task._zoneDelegates === zoneDelegates) {
                    this.updateTaskCount(task, 1);
                }
                if (task.state == scheduling) {
                    task.transitionTo(scheduled, scheduling);
                }
                return task;
            }

            scheduleMicroTask(source, callback, data, customSchedule) {
                return this.scheduleTask(new ZoneTask(microTask, source, callback, data, customSchedule, undefined));
            }

            scheduleMacroTask(source, callback, data, customSchedule, customCancel) {
                return this.scheduleTask(new ZoneTask(macroTask, source, callback, data, customSchedule, customCancel));
            }

            scheduleEventTask(source, callback, data, customSchedule, customCancel) {
                return this.scheduleTask(new ZoneTask(eventTask, source, callback, data, customSchedule, customCancel));
            }

            cancelTask(task) {
                if (task.zone != this)
                    throw new Error(`A task can only be cancelled in the zone of creation! (Creation: ${(task.zone || NO_ZONE).name}; Execution: ${this.name})`);

                if (task.state !== scheduled && task.state !== running) {
                    return;
                }
                task.transitionTo(canceling, scheduled, running);
                try {
                    this._delegate.cancelTask(this, task);
                } catch (err) {
                    task.transitionTo(unknown, canceling);
                    this._delegate.handleError(this, err);
                    throw err;
                }
                this.updateTaskCount(task, -1);
                task.transitionTo(notScheduled, canceling);
                task.runCount = -1;
                return task;
            }

            updateTaskCount(task, count) {
                const zoneDelegates = task._zoneDelegates;
                if (count == -1) {
                    task._zoneDelegates = null;
                }
                for (let i = 0; i < zoneDelegates.length; i++) {
                    zoneDelegates[i].updateTaskCount(task.type, count);
                }
            }
        }

        class ZoneDelegate {
            constructor(zone, parentDelegate, zoneSpec) {
                this._taskCounts = {
                    'microTask': 0,
                    'macroTask': 0,
                    'eventTask': 0,
                };
                this._zone = zone;
                this._parentDelegate = parentDelegate;
                this._forkZS = zoneSpec && (zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
                this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);
                this._forkCurrentZone = zoneSpec && (zoneSpec.onFork ? this._zone : parentDelegate._forkCurrentZone);

                // Other similar settings for _interceptZS, _invokeZS, _handleErrorZS, etc.

                const zoneSpecHasTask = zoneSpec && zoneSpec.onHasTask;
                const parentHasTask = parentDelegate && parentDelegate._hasTaskZS;
                if (zoneSpecHasTask || parentHasTask) {
                    this._hasTaskZS = zoneSpecHasTask ? zoneSpec : DELEGATE_ZS;
                    this._hasTaskDlgt = parentDelegate;
                    this._hasTaskDlgtOwner = this;
                    this._hasTaskCurrZone = this._zone;
                    
                    if (!zoneSpec.onScheduleTask) {
                        this._scheduleTaskZS = DELEGATE_ZS;
                        this._scheduleTaskDlgt = parentDelegate;
                        this._scheduleTaskCurrZone = this._zone;
                    }
                    if (!zoneSpec.onInvokeTask) {
                        this._invokeTaskZS = DELEGATE_ZS;
                        this._invokeTaskDlgt = parentDelegate;
                        this._invokeTaskCurrZone = this._zone;
                    }
                    if (!zoneSpec.onCancelTask) {
                        this._cancelTaskZS = DELEGATE_ZS;
                        this._cancelTaskDlgt = parentDelegate;
                        this._cancelTaskCurrZone = this._zone;
                    }
                }
            }

            get zone() {
                return this._zone;
            }

            fork(targetZone, zoneSpec) {
                return this._forkZS
                    ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec)
                    : new ZoneImplementation(targetZone, zoneSpec);
            }

            // More implementations of intercept, invoke, handleError like methods...

            updateTaskCount(type, count) {
                const counts = this._taskCounts;
                const prev = counts[type];
                const next = (counts[type] = prev + count);
                if (next < 0) {
                    throw new Error('More tasks executed then were scheduled.');
                }
                if (prev == 0 || next == 0) {
                    const isEmpty = {
                        microTask: counts['microTask'] > 0,
                        macroTask: counts['macroTask'] > 0,
                        eventTask: counts['eventTask'] > 0,
                        change: type,
                    };
                    this.hasTask(this._zone, isEmpty);
                }
            }

            // Other methods...
        }

        class ZoneTask {
            constructor(type, source, callback, options, scheduleFn, cancelFn) {
                this._zone = null;
                this.runCount = 0;
                this._zoneDelegates = null;
                this._state = 'notScheduled';
                this.type = type;
                this.source = source;
                this.data = options;
                this.scheduleFn = scheduleFn;
                this.cancelFn = cancelFn;

                if (!callback) throw new Error('callback is not defined');
                
                this.callback = callback;
                
                const self = this;
                if (type === eventTask && options && options.useG) {
                    this.invoke = ZoneTask.invokeTask;
                } else {
                    this.invoke = function() {
                        return ZoneTask.invokeTask.call(global, self, this, arguments);
                    };
                }
            }

            static invokeTask(task, context, args) {
                if (!task) task = this;
                numberOfNestedTaskFrames++;
                try {
                    task.runCount++;
                    return task.zone.runTask(task, context, args);
                } finally {
                    if (numberOfNestedTaskFrames === 1) {
                        drainMicroTaskQueue();
                    }
                    numberOfNestedTaskFrames--;
                }
            }

            get zone() {
                return this._zone;
            }

            get state() {
                return this._state;
            }

            cancelScheduleRequest() {
                this.transitionTo(notScheduled, scheduling);
            }

            transitionTo(toState, fromState1, fromState2) {
                if (this._state === fromState1 || this._state === fromState2) {
                    this._state = toState;
                    if (toState == notScheduled) {
                        this._zoneDelegates = null;
                    }
                } else {
                    throw new Error(`${this.type} '${this.source}': cannot transition to '${toState}', expecting state '${fromState1}'${fromState2 ? " or '" + fromState2 + "'" : ''}, was '${this._state}'.`);
                }
            }

            toString() {
                if (this.data && typeof this.data.handleId !== 'undefined') {
                    return this.data.handleId.toString();
                } else {
                    return Object.prototype.toString.call(this);
                }
            }

            toJSON() {
                return {
                    type: this.type,
                    state: this.state,
                    source: this.source,
                    zone: this.zone.name,
                    runCount: this.runCount,
                };
            }
        }

        const DELEGATE_ZS = {
            name: '',
            onHasTask: (delegate, _, target, hasTaskState) => delegate.hasTask(target, hasTaskState),
            onScheduleTask: (delegate, _, target, task) => delegate.scheduleTask(target, task),
            onInvokeTask: (delegate, _, target, task, applyThis, applyArgs) => delegate.invokeTask(target, task, applyThis, applyArgs),
            onCancelTask: (delegate, _, target, task) => delegate.cancelTask(target, task),
        };

        return ZoneImplementation;
    }

    function configureZone() {
        if (global['Zone']) throw new Error('Zone already loaded.');
        
        const zoneImpl = setupZone();
        global['Zone'] = zoneImpl;
        return global['Zone'];
    }

    var notScheduled = 'notScheduled';
    var scheduling = 'scheduling';
    var scheduled = 'scheduled';
    var running = 'running';
    var canceling = 'canceling';
    var unknown = 'unknown';

    var microTask = 'microTask';
    var macroTask = 'macroTask';
    var eventTask = 'eventTask';

    var zonePatches = {};
    var api = {
        symbol: createSymbol,
        scheduleMicroTask: function(task) {},
        patchMethod: function() {},
        bindArguments: function() {},
        patchThen: function() {},
        patchMacroTask: function() {},
        patchEventTarget: function() {},
        _redefineProperty: function() {},
        attachOriginToPatched: function() {},
    };

    var currentZoneFrame = { parent: null, zone: new setupZone() };
    var currentTask = null;
    var numberOfNestedTaskFrames = 0;

    function noop() {}

    return configureZone();
});
