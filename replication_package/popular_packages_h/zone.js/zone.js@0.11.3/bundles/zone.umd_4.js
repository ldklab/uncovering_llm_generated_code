(function (global) {
    'use strict';

    var Zone = (function () {
        var zoneSymbol = function(name) { return '__zone_symbol__' + name; };
        var Zone = function (parent, zoneSpec) {
            this._parent = parent;
            this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
            this._properties = zoneSpec && zoneSpec.properties || {};
            this._zoneDelegate = new ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
        };

        Zone.assertZonePatched = function () {
            if (global['Promise'] !== patches['ZoneAwarePromise']) {
                throw new Error('Zone.js has detected that ZoneAwarePromise has been overwritten.');
            }
        };

        Object.defineProperty(Zone, "root", {
            get: function () {
                var zone = Zone.current;
                while (zone.parent) {
                    zone = zone.parent;
                }
                return zone;
            }
        });

        Object.defineProperty(Zone, "current", {
            get: function () { return _currentZoneFrame.zone; }
        });

        Object.defineProperty(Zone, "currentTask", {
            get: function () { return _currentTask; }
        });

        Zone.__load_patch = function (name, fn) {
            if (!global['__Zone_disable_' + name]) {
                patches[name] = fn(global, Zone, _api);
            }
        };

        Zone.prototype.fork = function (zoneSpec) {
            if (!zoneSpec) throw new Error('ZoneSpec required!');
            return this._zoneDelegate.fork(this, zoneSpec);
        };

        Zone.prototype.runTask = function (task, applyThis, applyArgs) {
            if (task.zone != this) {
                throw new Error('A task can only be run in the zone of creation!');
            }
            
            var reEntryGuard = task.state != running;
            if (reEntryGuard) task._transitionTo(running, scheduled);
            task.runCount++;
            _currentTask = task;
            _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
            try {
                if (task.type == macroTask && task.data && !task.data.isPeriodic) task.cancelFn = undefined;
                return this._zoneDelegate.invokeTask(this, task, applyThis, applyArgs);
            } finally {
                if (task.state !== notScheduled && task.state !== unknown) {
                    if (task.type == eventTask || task.data.isPeriodic) 
                        task._transitionTo(scheduled, running);
                    else 
                        task.runCount = 0;
                    reEntryGuard && task._transitionTo(notScheduled, running, notScheduled);
                }
                _currentZoneFrame = _currentZoneFrame.parent;
                _currentTask = previousTask;
            }
        };

        var ZoneDelegate = function (zone, parentDelegate, zoneSpec) {
            this._taskCounts = { 'microTask': 0, 'macroTask': 0, 'eventTask': 0 };
            this.zone = zone;
            this._parentDelegate = parentDelegate;
            this._forkZS = zoneSpec && (zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
            this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);
            this._forkCurrZone = zoneSpec && (zoneSpec.onFork ? this.zone : parentDelegate._forkCurrZone);
        };

        ZoneDelegate.prototype.fork = function (targetZone, zoneSpec) {
            return this._forkZS ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec) : new Zone(targetZone, zoneSpec);
        };

        var ZoneTask = function (type, source, callback, options, scheduleFn, cancelFn) {
            this._zone = null;
            this.runCount = 0;
            this._zoneDelegates = null;
            this._state = 'notScheduled';
            if (!callback) throw new Error('callback is not defined');
            this.callback = callback;
            var self = this;
        };

        function scheduleMicroTask(task) {
            if (_numberOfNestedTaskFrames === 0 && _microTaskQueue.length === 0) {
                if (!nativeMicroTaskQueuePromise) {
                    if (global[symbolPromise]) nativeMicroTaskQueuePromise = global[symbolPromise].resolve(0);
                }
                if (nativeMicroTaskQueuePromise) {
                    nativeMicroTaskQueuePromise.then(drainMicroTaskQueue);
                } else {
                    global[symbolSetTimeout](drainMicroTaskQueue, 0);
                }
            }
            task && _microTaskQueue.push(task);
        }

        function drainMicroTaskQueue() {
            if (!_isDrainingMicrotaskQueue) {
                _isDrainingMicrotaskQueue = true;
                while (_microTaskQueue.length) {
                    var queue = _microTaskQueue;
                    _microTaskQueue = [];
                    for (var i = 0; i < queue.length; i++) {
                        var task = queue[i];
                        try { task.zone.runTask(task, null, null); } 
                        catch (error) { _api.onUnhandledError(error); }
                    }
                }
                _api.microtaskDrainDone();
                _isDrainingMicrotaskQueue = false;
            }
        }

        function patchEventTarget(_global, api) {
            var ADD_EVENT_LISTENER = ADD_EVENT_LISTENER_STR;
            var REMOVE_EVENT_LISTENER = REMOVE_EVENT_LISTENER_STR;
            var zoneSymbolAddEventListener = zoneSymbol(ADD_EVENT_LISTENER);
            var ADD_EVENT_LISTENER_SOURCE = '.' + ADD_EVENT_LISTENER + ':';
            var invokeTask = function(task, target, event) {
                if (task.isRemoved) return;
                task.invoke(task, target, [event]);
            };
        }

        return Zone;
    })();

    function patchTimer(window, setName, cancelName, nameSuffix) {
        var setNative = patchMethod(window, setName, function (delegate) {
            return function (self, args) {
                return delegate.apply(self, args);
            };
        });
    }

    function patchMethod(target, name, patchFn) {
        var proto = target;
        while (proto && !proto.hasOwnProperty(name)) {
            proto = Object.getPrototypeOf(proto);
        }
        if (!proto && target[name]) {
            proto = target;
        }
        var delegateName = zoneSymbol(name);
        var delegate = null;
        if (proto && !(delegate = proto[delegateName])) {
            delegate = proto[delegateName] = proto[name];
            proto[name] = function () {
                return patchFn(delegate).apply(this, arguments);
            };
        }
        return delegate;
    }

    var _api = {
        patchEventTarget: patchEventTarget,
        patchEventPrototype: function () {},
    };

    _api.patchEventTarget(global, [global.EventTarget]);

    global['Zone'] = Zone;
})(typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global);
