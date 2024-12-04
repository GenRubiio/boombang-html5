
const publicAreasCollection = require('../collections/publicAreasCollection');
const publicAreaModel = require('../models/publicAreaModel');
const ConsoleLogger = require('../utils/consoleLogger');
const logger = new ConsoleLogger();

class LoadPublicAreasTask {
    static main() {
        logger.log('Preloading public areas...');

        const MAP_WIDTH = 30;
        const MAP_HEIGHT = 30;
        const start_position = {
            x: 14,
            y: 18
        };
        let gameMap = [];

        for (let y = 0; y < MAP_HEIGHT; y++) {
            let row = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                row.push(0); // 0 = caminable, 1 = obstáculo
            }
            gameMap.push(row);
        }
        publicAreasCollection.add(1, new publicAreaModel(1, 'Public Area 1', MAP_WIDTH, MAP_HEIGHT, gameMap, start_position));
        publicAreasCollection.add(2, new publicAreaModel(2, 'Public Area 2', MAP_WIDTH, MAP_HEIGHT, gameMap, start_position));

        logger.log('Public areas loaded: ' + publicAreasCollection.getAll().length, 'info');
    }
}

module.exports = LoadPublicAreasTask;