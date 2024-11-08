/* 
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/
'use strict';

const { MapStore } = require('./lib/map-store');

module.exports = {
    createSourceMapStore(options) {
        return new MapStore(options);
    }
};
