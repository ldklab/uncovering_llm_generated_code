'use strict';

const CONFIG = require('./svgo/config.js'),
      SVG2JS = require('./svgo/svg2js.js'),
      PLUGINS = require('./svgo/plugins.js'),
      JSAPI = require('./svgo/jsAPI.js'),
      { encodeSVGDatauri } = require('./svgo/tools.js'),
      JS2SVG = require('./svgo/js2svg.js');

class SVGO {
    constructor(config) {
        this.config = CONFIG(config);
    }

    optimize(svgstr, info = {}) {
        return new Promise((resolve, reject) => {
            if (this.config.error) {
                reject(this.config.error);
                return;
            }

            const maxPassCount = this.config.multipass ? 10 : 1;
            let counter = 0;
            let prevResultSize = Number.POSITIVE_INFINITY;

            const optimizeOnceCallback = (svgjs) => {
                if (svgjs.error) {
                    reject(svgjs.error);
                    return;
                }

                info.multipassCount = counter;
                if (++counter < maxPassCount && svgjs.data.length < prevResultSize) {
                    prevResultSize = svgjs.data.length;
                    this._optimizeOnce(svgjs.data, info, optimizeOnceCallback);
                } else {
                    if (this.config.datauri) {
                        svgjs.data = encodeSVGDatauri(svgjs.data, this.config.datauri);
                    }
                    if (info.path) {
                        svgjs.path = info.path;
                    }
                    resolve(svgjs);
                }
            };

            this._optimizeOnce(svgstr, info, optimizeOnceCallback);
        });
    }

    _optimizeOnce(svgstr, info, callback) {
        SVG2JS(svgstr, (svgjs) => {
            if (svgjs.error) {
                callback(svgjs);
                return;
            }

            svgjs = PLUGINS(svgjs, info, this.config.plugins);
            callback(JS2SVG(svgjs, this.config.js2svg));
        });
    }

    createContentItem(data) {
        return new JSAPI(data);
    }
}

SVGO.Config = CONFIG;

module.exports = SVGO;
module.exports.default = SVGO;
