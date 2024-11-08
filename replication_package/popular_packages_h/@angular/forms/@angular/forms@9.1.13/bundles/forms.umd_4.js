(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs'), require('rxjs/operators'))
        : typeof define === 'function' && define.amd
        ? define('@angular/forms', ['exports', '@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'], factory)
        : ((global = global || self), factory((global.ng = global.ng || {}, global.ng.forms = {}), global.ng.core, global.ng.common, global.rxjs, global.rxjs.operators));
})(this, function (exports, core, common, rxjs, operators) {
    'use strict';
    
    // Definitions for Angular forms - structures FormControl, FormGroup, FormArray
    // Sync and Async Validators - to validate forms input data
    // Control Value Accessors - to interface form controls with DOM elements
    // Utility functions - to manage control paths, set up forms, and manipulate form statuses

    // Validators
    const Validators = {
        required: function(control) { 
            return isEmptyInputValue(control.value) ? {'required': true} : null; 
        },
        email: function(control) { 
            return EMAIL_REGEXP.test(control.value) ? null : { 'email': true }; 
        },
        // ...other validators
    };

    // Form Directives for Reactive and Template-Driven Forms
    var FormControlDirective = /** @class */ (function (_super) {
        __extends(FormControlDirective, _super);
        function FormControlDirective(validators, asyncValidators, valueAccessors) {
            // ...
        }
        return FormControlDirective;
    }(NgControl));

    // NgForm - manages instance of Forms (template-driven)
    var NgForm = /** @class */ (function (_super) {
        __extends(NgForm, _super);
        function NgForm(validators, asyncValidators) {
            // ...
        }
        return NgForm;
    }(ControlContainer));

    // Export Parts of the Library
    exports.FormControl = FormControl;
    exports.FormGroup = FormGroup;
    exports.FormArray = FormArray;
    exports.FormsModule = FormsModule;
    exports.ReactiveFormsModule = ReactiveFormsModule;

    Object.defineProperty(exports, '__esModule', { value: true });
});
