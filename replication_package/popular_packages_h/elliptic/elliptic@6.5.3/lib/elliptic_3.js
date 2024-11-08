'use strict';

const elliptic = exports;

elliptic.version = require('../package.json').version;
elliptic.utils = require('./elliptic/utils');
elliptic.rand = require('brorand');
elliptic.curve = require('./elliptic/curve');
elliptic.curves = require('./elliptic/curves');

// Protocols for elliptic curve cryptography
elliptic.ec = require('./elliptic/ec');
elliptic.eddsa = require('./elliptic/eddsa');
