'use strict';
/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const path = require('path');

module.exports = {
    create(name, cfg = {}) {
        let Cons;
        try {
            Cons = require(path.join(__dirname, 'lib', name));
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND') {
                throw error;
            }
            Cons = require(name);
        }
        return new Cons(cfg);
    }
};
