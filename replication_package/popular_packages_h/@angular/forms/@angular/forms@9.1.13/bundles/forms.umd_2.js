/**
 * Angular Reactive Forms Package - UMD Module
 */

(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs'), require('rxjs/operators'));
    } else if (typeof define === 'function' && define.amd) {
        define('@angular/forms', ['exports', '@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'], factory);
    } else {
        (global = global || self, factory((global.ng = global.ng || {}, global.ng.forms = {}), global.ng.core, global.ng.common, global.rxjs, global.rxjs.operators));
    }
}(this, (function(exports, core, common, rxjs, operators) {
    'use strict';

    const version = new core.Version('9.1.13');

    const NG_VALUE_ACCESSOR = new core.InjectionToken('NgValueAccessor');
    const CHECKBOX_VALUE_ACCESSOR = { provide: NG_VALUE_ACCESSOR, useExisting: core.forwardRef(() => CheckboxControlValueAccessor), multi: true };

    const Validators = {
        required: control => isEmpty(control.value) ? { 'required': true } : null,
        minLength: length => control => control.value && control.value.length < length ? { 'minLength': { 'requiredLength': length, 'actualLength': control.value.length } } : null,
        // Define other validators...
    };

    function isEmpty(value) {
        return value == null || value.length === 0;
    }

    class FormControl extends AbstractControl {
        constructor(value, validator = null, asyncValidator = null) {
            super(validator, asyncValidator);
            this.value = value;
        }
        setValue(value) {
            this.value = value;
        }
    }

    class AbstractControl {
        constructor(validator, asyncValidator) {
            this.validator = validator;
            this.asyncValidator = asyncValidator;
        }
        validate() {
            return this.validator ? this.validator(this) : null;
        }
    }

    class NgModel {
        constructor() {
            this.valueChanges = new rxjs.Subject();
        }
    }
    
    // Ensure additional classes and functionalities are defined similarly...

    // Export components
    exports.FormControl = FormControl;
    exports.NgModel = NgModel;
    exports.Validators = Validators;
    exports.AbstractControl = AbstractControl;
    // Export other necessary classes...

})));
