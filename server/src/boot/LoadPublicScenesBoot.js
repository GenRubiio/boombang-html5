
const uuidv4 = require('uuid');
const PublicScenesCollection = require('../collections/PublicScenesCollection');
const PublicSceneModel = require('../models/PublicSceneModel');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const PublicSceneApiService = require('../services-api/PublicSceneApiService');

class LoadPublicScenesBoot {
    static async main() {
        logger.log('Preloading public scenes...');

        const response = await PublicSceneApiService.get();
        if (!response || !response.scenes || !response.scenes.length) {
            logger.log('Error loading public scenes', 'error');
            return;
        }
        const scenes = response.scenes;
        scenes.forEach(scene => {
            const uuid = uuidv4.v4();
            PublicScenesCollection.add(uuid, new PublicSceneModel(uuid, scene));
        });

        logger.log('Public scenes loaded: ' + PublicScenesCollection.getAll().length, 'info');
    }
}

module.exports = LoadPublicScenesBoot;