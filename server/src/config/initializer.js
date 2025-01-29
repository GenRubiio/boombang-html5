const LoadPublicAreasTask = require('../tasks/LoadPublicAreasTask');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

const initializer = () => {
    logger.log('Initializing preloaded data...');
    
    LoadPublicAreasTask.main();
};

module.exports = { initializer };