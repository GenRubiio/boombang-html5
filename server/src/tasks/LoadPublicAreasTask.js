
const PublicAreasCollection = require('../collections/PublicAreasCollection');
const PublicAreaModel = require('../models/PublicAreaModel');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const PublicSceneApiService = require('../services-api/PublicSceneApiService');

class LoadPublicAreasTask {
    static async main() {
        logger.log('Preloading public areas...');

        const publicAreasResponse = await PublicSceneApiService.get();
        if (!publicAreasResponse || !publicAreasResponse.scenes || !publicAreasResponse.scenes.length) {
            logger.log('Error loading public areas', 'error');
            return;
        }
        const publicAreas = publicAreasResponse.scenes;
        publicAreas.forEach(publicArea => {
            PublicAreasCollection.add(publicArea.id, new PublicAreaModel(publicArea));
        });

        logger.log('Public areas loaded: ' + PublicAreasCollection.getAll().length, 'info');
    }
}

module.exports = LoadPublicAreasTask;