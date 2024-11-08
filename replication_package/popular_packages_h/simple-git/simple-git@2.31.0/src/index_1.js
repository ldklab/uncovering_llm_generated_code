const { gitP } = require('./lib/runners/promise-wrapped');
const { esModuleFactory, gitInstanceFactory, gitExportFactory } = require('./git-factory');

const gitModule = esModuleFactory(
    gitExportFactory(gitInstanceFactory, { gitP })
);

module.exports = gitModule;
