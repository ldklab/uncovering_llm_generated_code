const { gitP } = require('./lib/runners/promise-wrapped');
const { esModuleFactory, gitInstanceFactory, gitExportFactory } = require('./git-factory');

// Create an instance using gitInstanceFactory with configuration {gitP}
const gitInstance = gitInstanceFactory({ gitP });

// Export the module using esModuleFactory and gitExportFactory
const gitExport = gitExportFactory(gitInstance);

// Create the final ES module
const esModule = esModuleFactory(gitExport);

module.exports = esModule;
