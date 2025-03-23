
const PublicScenesCollection = require('../collections/PublicScenesCollection');
const PublicSceneModel = require('../models/PublicSceneModel');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const PublicSceneApiService = require('../services-api/PublicSceneApiService');

class LoadPublicScenesBoot {
    static async main() {
        logger.log('Preloading public areas...');

        const response = await PublicSceneApiService.get();
        if (!response || !response.scenes || !response.scenes.length) {
            logger.log('Error loading public areas', 'error');
            return;
        }
        const publicScenes = response.scenes;
        publicScenes.forEach(scene => {
            PublicScenesCollection.add(scene.id, new PublicSceneModel(scene));
        });

        logger.log('Public areas loaded: ' + PublicScenesCollection.getAll().length, 'info');
    }
}

module.exports = LoadPublicScenesBoot;