const LoadPublicScenesBoot = require('../boot/LoadPublicScenesBoot');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

const initializer = () => {
    logger.log('Initializing preloaded data...');
    
    LoadPublicScenesBoot.main();
};

module.exports = { initializer };