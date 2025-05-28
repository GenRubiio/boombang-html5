const LoadPublicScenesBoot = require('../boot/LoadPublicScenesBoot');
const LoadMinigameScenesBoot = require('../boot/LoadMinigameScenesBoot');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

const initializer = async () => {
    logger.log('Initializing preloaded data...');
    
    await LoadPublicScenesBoot.main();
    await LoadMinigameScenesBoot.main();
};

module.exports = { initializer };