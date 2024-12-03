const { loadPublicAreasTask } = require('../tasks/loadPublicAreasTask');
const ConsoleLogger = require('../utils/consoleLogger');
const logger = new ConsoleLogger();

const initializer = () => {
    logger.log('Initializing preloaded data...');
    
    loadPublicAreasTask();
};

module.exports = { initializer };