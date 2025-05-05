
const MinigameScenesCollection = require('../collections/MinigameScenesCollection');
const MinigameSceneModel = require('../models/MinigameSceneModel');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const MinigameSceneApiService = require('../services-api/MinigameSceneApiService');

class LoadMinigameScenesBoot {
    static async main() {
        logger.log('Preloading minigame scenes...');

        const response = await MinigameSceneApiService.get();
        if (!response || !response.scenes || !response.scenes.length) {
            logger.log('Error loading public scenes', 'error');
            return;
        }
        const scenes = response.scenes;
        scenes.forEach(scene => {
            MinigameScenesCollection.add(scene.id, new MinigameSceneModel(scene));
        });

        logger.log('Minigame scenes loaded: ' + MinigameScenesCollection.getAll().length, 'info');
    }
}

module.exports = LoadMinigameScenesBoot;