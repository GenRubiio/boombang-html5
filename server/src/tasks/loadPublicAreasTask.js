
const PublicAreasCollection = require('../collections/PublicAreasCollection');
const PublicAreaModel = require('../models/PublicAreaModel');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

class LoadPublicAreasTask {
    static main() {
        logger.log('Preloading public areas...');

        const MAP_WIDTH = 30;
        const MAP_HEIGHT = 30;
        const start_position = {
            x: 1,
            y: 3,
            z: 2
        };
        let gameMap = [];

        for (let y = 0; y < MAP_HEIGHT; y++) {
            let row = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                row.push(0); // 0 = caminable, 1 = obstáculo
            }
            gameMap.push(row);
        }
        PublicAreasCollection.add(1, new PublicAreaModel(1, 'Public Area 1', MAP_WIDTH, MAP_HEIGHT, gameMap, start_position));
        PublicAreasCollection.add(2, new PublicAreaModel(2, 'Public Area 2', MAP_WIDTH, MAP_HEIGHT, gameMap, start_position));

        logger.log('Public areas loaded: ' + PublicAreasCollection.getAll().length, 'info');
    }
}

module.exports = LoadPublicAreasTask;