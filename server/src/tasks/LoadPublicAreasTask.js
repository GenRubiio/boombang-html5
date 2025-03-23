
const PublicScenesCollection = require('../collections/PublicScenesCollection');
const PublicAreaModel = require('../models/PublicAreaModel');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const PublicSceneApiService = require('../services-api/PublicSceneApiService');

class LoadPublicAreasTask {
    static async main() {
        logger.log('Preloading public areas...');

        const response = await PublicSceneApiService.get();
        if (!response || !response.scenes || !response.scenes.length) {
            logger.log('Error loading public areas', 'error');
            return;
        }
        const publicScenes = response.scenes;
        publicScenes.forEach(scene => {
            PublicScenesCollection.add(scene.id, new PublicAreaModel(scene));
        });

        logger.log('Public areas loaded: ' + PublicScenesCollection.getAll().length, 'info');
    }
}

module.exports = LoadPublicAreasTask;