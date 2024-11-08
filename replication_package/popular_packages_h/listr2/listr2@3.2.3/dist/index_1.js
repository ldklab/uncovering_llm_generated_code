"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const modulesToExport = [
    './listr',
    './manager',
    './interfaces/index',
    './utils/logger',
    './utils/logger.constants',
    './utils/prompt.interface',
    './utils/prompt'
];

modulesToExport.forEach(modulePath => {
    const module = require(modulePath);
    Object.keys(module).forEach(exportKey => {
        if (exportKey !== 'default') {
            Object.defineProperty(exports, exportKey, {
                enumerable: true,
                get: () => module[exportKey]
            });
        }
    });
});
