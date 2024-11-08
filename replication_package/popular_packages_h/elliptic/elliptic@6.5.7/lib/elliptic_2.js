'use strict';

const elliptic = exports;

const packageJson = require('../package.json');
const utils = require('./elliptic/utils');
const rand = require('brorand');
const curve = require('./elliptic/curve');
const curves = require('./elliptic/curves');
const ec = require('./elliptic/ec');
const eddsa = require('./elliptic/eddsa');

elliptic.version = packageJson.version;
elliptic.utils = utils;
elliptic.rand = rand;
elliptic.curve = curve;
elliptic.curves = curves;
elliptic.ec = ec;
elliptic.eddsa = eddsa;
