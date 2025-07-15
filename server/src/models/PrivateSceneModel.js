const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const IslandModel = require('./IslandModel');
const UserCatalogItemModel = require('./UserCatalogItemModel'); // Importar el modelo de UserCatalogItem

class PrivateSceneModel extends SceneModel {
    constructor(uuid, row) {
        super(row); // Llama al constructor de la clase padre
        this.uuid = uuid; // UUID único de la escena
        this.max_users = row.max_users; // Número máximo de usuarios permitidos en el área
        this.scene_type = SceneTypesEnum.PRIVATE_SCENE;// Tipo de modelo
        this.colors = row.colors; // Colores personalizados de la escena
        this.has_password = row.has_password || null; // Contraseña de la escena privada
        //this.objects = row.objects ? row.objects.map(item => new SceneItemModel(item)) : []; // Lista de objetos activos en la escena
        this.max_objects = 20; // Número máximo de objetos permitidos en la escena
        this.objects = row.objects ? row.objects.map(item => new UserCatalogItemModel(item)) : []; // Lista de objetos del catálogo del usuario en la escena
        this.island = new IslandModel(row.island); // Isla asociada a la escena
        this.user_id = row.user_id; // ID del usuario propietario de la escena
    }
    
    /**
     * @override
     */
    getNavigationMapWithPlayers(excludeUserId) {
        // Get the base map with players and reserved tiles from the parent
        let navigationMap = super.getNavigationMapWithPlayers(excludeUserId);

        // Block tiles occupied by objects
        if (this.objects && this.objects.length > 0) {
            this.objects.forEach(object => {
                if (object.occupied_tiles && object.occupied_tiles.length > 0) {
                    object.occupied_tiles.forEach(tile => {
                        const [x, y] = tile;
                        if (navigationMap[y] && navigationMap[y][x] !== undefined) {
                            navigationMap[y][x] = 1; // Mark as unwalkable
                        }
                    });
                }
            });
        }

        return navigationMap;
    }
}

module.exports = PrivateSceneModel; 