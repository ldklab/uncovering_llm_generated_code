const { gitP } = require('./lib/runners/promise-wrapped');
const { esModuleFactory, gitInstanceFactory, gitExportFactory } = require('./git-factory');

const gitModuleExports = gitExportFactory(gitInstanceFactory, { gitP });
const gitModule = esModuleFactory(gitModuleExports);

module.exports = gitModule;
