const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const IslandModel = require('./IslandModel');
const UserCatalogItemModel = require('./UserCatalogItemModel'); // Importar el modelo de UserCatalogItem
const UserResource = require('../resources/UserResource');
const PrivateSceneResource = require('../resources/PrivateSceneResource');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const CatalogItemTypeOfBehaviorEnum = require('../enums/CatalogItemTypeOfBehaviorEnum');
const sceneMutex = require('../utils/SceneMutex');

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
        this.island_id = row.island_id; // ID de la isla a la que pertenece la escena
        this.user_id = row.user_id; // ID del usuario propietario de la escena
    }

    /**
     * @override
     */
    getNavigationMapWithPlayers(excludeUserId) {
        // Get the base map with players and reserved tiles from the parent
        let navigationMap = super.getNavigationMapWithPlayers(excludeUserId);

        // Block tiles occupied by objects (except WALKABLE items)
        if (this.objects && this.objects.length > 0) {
            this.objects.forEach(object => {
                if (object.occupied_tiles && object.occupied_tiles.length > 0) {
                    object.occupied_tiles.forEach(tile => {
                        const [x, y] = tile;
                        if (navigationMap[y] && navigationMap[y][x] !== undefined) {
                            // Only block navigation if the object is NOT WALKABLE or WALKABLE_OVERLAY
                            if (object.type_of_behavior !== CatalogItemTypeOfBehaviorEnum.WALKABLE && 
                                object.type_of_behavior !== CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY) {
                                navigationMap[y][x] = 1; // Mark as unwalkable
                            }
                            // WALKABLE items don't block navigation, so we skip marking them
                        }
                    });
                }
            });
        }

        return navigationMap;
    }

    async userJoin(user, userInventoryItems, sceneConfig) {
        // Usar el mutex global para sincronizar el acceso a la escena
        const release = await sceneMutex.acquire(this.id);

        try {
            // Agregar usuario a la escena de manera atómica
            user.setArea(this);
            user.setInventory(userInventoryItems || []);
            this.addUser(user);
            
            // Obtener la lista actualizada de usuarios
            let sceneUsers = [];
            for (const sceneUser of this.users) {
                sceneUsers.push(await new UserResource(sceneUser).toObject());
            }
            
            // Enviar respuesta al usuario que se está uniendo
            user.socket.emit(ResponseSocketsEnum.JOIN_PRIVATE_SCENE, {
                success: true,
                data: {
                    players: sceneUsers,
                    scenery: await new PrivateSceneResource(this).toObject(),
                    authUser: await new UserResource(user).toObject(),
                    userInventory: user.inventory,
                    myScene: this.user_id == user.id,
                    sceneConfig: sceneConfig || {},
                }
            });
            
            // Pequeño delay antes de notificar a otros usuarios
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Notificar a todos los demás usuarios
            this.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                user: await new UserResource(user).toObject(),
            }, user);
            
        } finally {
            // Liberar el mutex
            release();
        }
    }
}

module.exports = PrivateSceneModel; 