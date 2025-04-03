const LoadPublicScenesBoot = require('../boot/LoadPublicScenesBoot');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

const initializer = async () => {
    logger.log('Initializing preloaded data...');
    
    await LoadPublicScenesBoot.main();
};

module.exports = { initializer };