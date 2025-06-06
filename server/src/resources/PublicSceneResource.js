const Resource = require('./Resource');

class PublicSceneResource extends Resource {
    transform(data) {
        return {
            id: data.id,
            name: data.name,
            type: data.type,
            menu_type: data.menuType,
            map_rows: data.mapWidth,
            map_cols: data.mapHeight,
            game_map: data.gameMap,
            items: data.possibleItems,
        };
    }
}

module.exports = PublicSceneResource;