const uuidv4 = require('uuid');
const GameScenesCollection = require('../collections/GameScenesCollection');
const GameSceneModel = require('../models/GameSceneModel.js');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const GameSceneApiService = require('../services-api/GameSceneApiService');

class LoadGameScenesBoot {
    static async main() {
        logger.log('Preloading game scenes...');

        const response = await GameSceneApiService.get();
        if (!response || !response.scenes || !response.scenes.length) {
            logger.log('Error loading game scenes', 'error');
            return;
        }
        const scenes = response.scenes;
        scenes.forEach(scene => {
            const uuid = uuidv4.v4();
            GameScenesCollection.add(uuid, new GameSceneModel(uuid, scene));
        });

        logger.log('Game scenes loaded: ' + GameScenesCollection.getAll().length, 'info');
    }
}

module.exports = LoadGameScenesBoot;