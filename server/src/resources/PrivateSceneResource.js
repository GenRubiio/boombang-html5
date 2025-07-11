const Resource = require('./Resource');
const IslandResource = require('./IslandResource');

class PrivateSceneResource extends Resource {
    transform(data) {
        return {
            uuid: data.uuid,
            id: data.id,
            name: data.name,
            type: data.type,
            colors: data.colors,
            my_scene: data.my_scene,
            menu_type: data.menu_type,
            map_rows: data.map_width,
            map_cols: data.map_height,
            game_map: data.game_map,
            items: [],
            island: new IslandResource(data.island),
            objects: data.objects,
        };
    }
}

module.exports = PrivateSceneResource;