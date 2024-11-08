/**
 * Angular Forms v9.1.13
 * Released under MIT license
 */

// Universal Module Definition (UMD) pattern
(function (global, factory) {
    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/core'), require('@angular/common'));
    }
    // AMD
    else if (typeof define === 'function' && define.amd) {
        define(['exports', '@angular/core', '@angular/common'], factory);
    }
    // Global
    else {
        global = global || self;
        factory((global.ng = global.ng || {}, global.ng.forms = {}), global.ng.core, global.ng.common);
    }
}(this, (function (exports, core, common) {
    'use strict';

    // Define key components for handling forms
    const NG_VALUE_ACCESSOR = new core.InjectionToken('NgValueAccessor');
    const NG_VALIDATORS = new core.InjectionToken('NgValidators');
    const NG_ASYNC_VALIDATORS = new core.InjectionToken('NgAsyncValidators');
    
    // Form Control Component
    class FormControl {
        constructor(value) {
            this.value = value || null;
        }
    }

    // Form Group Component
    class FormGroup {
        constructor(controls) {
            this.controls = controls;
        }
    }

    // Form Array Component
    class FormArray {
        constructor(controls) {
            this.controls = controls;
        }
    }
    
    // Validators
    var Validators = {
        required: function(control) {
            return control.value ? null : { 'required': true };
        }
    };

    // Export components
    exports.NG_VALUE_ACCESSOR = NG_VALUE_ACCESSOR;
    exports.NG_VALIDATORS = NG_VALIDATORS;
    exports.NG_ASYNC_VALIDATORS = NG_ASYNC_VALIDATORS;
    exports.FormControl = FormControl;
    exports.FormGroup = FormGroup;
    exports.FormArray = FormArray;
    exports.Validators = Validators;
    
})));
