'use strict';

// Define and export the elliptic object with various components
var elliptic = exports;

// Export the current version of the package
elliptic.version = require('../package.json').version;

// Add utility functions to the elliptic object
elliptic.utils = require('./elliptic/utils');

// Attach a random number generator to the elliptic object
elliptic.rand = require('brorand');

// Import curve functionalities and add them to the elliptic object
elliptic.curve = require('./elliptic/curve');
elliptic.curves = require('./elliptic/curves');

// Import and export cryptographic protocols for elliptic curves
elliptic.ec = require('./elliptic/ec');
elliptic.eddsa = require('./elliptic/eddsa');
