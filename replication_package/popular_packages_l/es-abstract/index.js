     var ES = require('es-abstract');
     var assert = require('assert');

     assert(ES.isCallable(function () {})); // returns true
     assert(!ES.isCallable(/a/g));          // returns false
     