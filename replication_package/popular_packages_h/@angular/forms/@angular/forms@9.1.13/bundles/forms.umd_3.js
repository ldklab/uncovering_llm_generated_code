(function (global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(require('@angular/core'), require('@angular/common'), require('rxjs'), require('rxjs/operators'));
  } else if (typeof define === "function" && define.amd) {
    define(['@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'], factory);
  } else {
    global.ng = global.ng || {};
    global.ng.forms = factory(global.ng.core, global.ng.common, global.rxjs, global.rxjs.operators);
  }
}(this, function (core, common, rxjs, operators) {
  'use strict';

  // UMD Wrapper Angular v9.1.13 - Forms Implementation exporting Classes, Directives and Utilities for Angular Forms

  // Angular Form Control class definitions and exports
  class FormControl { /* FormControl Implementation */ }
  class FormGroup { /* FormGroup Implementation */ }
  class FormArray { /* FormArray Implementation */ }
  
  // Angular Validators
  const Validators = {
    required: function (control) {
      return control.value ? null : { required: true };
    },
    // other validator functions...
  };

  // Form Directives
  @Directive({ selector: '[formControl]', /* More annotation properties */ })
  class FormControlDirective { /* Directive Implementation */ }

  @Directive({ selector: '[formGroup]', /* More annotation properties */ })
  class FormGroupDirective { /* Directive Implementation */ }

  // ...additional Angular Forms code...

  // Exposing the necessary components, directives, and classes
  return {
    FormControl,
    FormGroup,
    FormArray,
    Validators,
    FormControlDirective,
    FormGroupDirective
    // ... other exports ...
  };
}));
