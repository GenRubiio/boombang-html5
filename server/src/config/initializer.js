const LoadPublicAreasTask = require('../tasks/LoadPublicAreasTask');
const LoadAvatarAnimationsTask = require('../tasks/LoadAvatarAnimationsTask');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

const initializer = () => {
    logger.log('Initializing preloaded data...');
    
    LoadPublicAreasTask.main();
    LoadAvatarAnimationsTask.main();
};

module.exports = { initializer };