const Resource = require('./Resource');

class PublicSceneResource extends Resource {
    transform(data) {
        return {
            uuid: data.uuid,
            id: data.id,
            name: data.name,
            type: data.type,
            menu_type: data.menu_type,
            map_rows: data.map_width,
            map_cols: data.map_height,
            game_map: data.game_map,
            items: data.possible_items,
        };
    }
}

module.exports = PublicSceneResource;