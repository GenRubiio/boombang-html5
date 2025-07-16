const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const SceneTypesEnum = require('../../../enums/SceneTypesEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');

class PutItemPrivateSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.currentArea ||
                user.currentArea.scene_type != SceneTypesEnum.PRIVATE_SCENE ||
                user.currentArea.user_id != user.id
            ) return;

            const { user_catalog_item_id, occupied_tiles, is_move } = data;

            if (is_move) {
                // Logic for moving an item already in the scene
                const itemToMove = user.currentArea.objects.find(item => item.id == user_catalog_item_id);
                if (!itemToMove) {
                    throw new Error('Item to move not found in the scene');
                }

                if (!this.#validateOccupiedTiles(user.currentArea, occupied_tiles, user_catalog_item_id)) {
                    throw new Error('Occupied tiles validation failed for move');
                }
                
                // Free up old tiles
                itemToMove.occupied_tiles.forEach(tile => {
                    const [x, y] = tile;
                    if (user.currentArea.navigationMapBase[y] && user.currentArea.navigationMapBase[y][x] !== undefined) {
                        user.currentArea.navigationMapBase[y][x] = 0; // Mark as walkable
                    }
                });

                // Update item's position
                itemToMove.occupied_tiles = occupied_tiles;

                // Occupy new tiles
                occupied_tiles.forEach(tile => {
                    const [x, y] = tile;
                    if (user.currentArea.navigationMapBase[y] && user.currentArea.navigationMapBase[y][x] !== undefined) {
                        user.currentArea.navigationMapBase[y][x] = 1; // Mark as unwalkable
                    }
                });

                user.currentArea.emit(ResponseSocketsEnum.SCENE_PUT_ITEM, {
                    item: itemToMove
                });

                PrivateSceneApiService.updateItemPosition({
                    user_catalog_item_id: user_catalog_item_id,
                    occupied_tiles: occupied_tiles
                }, user);
            } else {
                // Logic for placing a new item from inventory
                const userCatalogItemIndex = user.inventory.findIndex(item => item.id == user_catalog_item_id);
                if (userCatalogItemIndex === -1) {
                    throw new Error('Item not found in user inventory');
                }

                if (user.currentArea.objects.length >= user.currentArea.max_objects) {
                    throw new Error('Maximum number of objects reached in the scene');
                }

                if (!this.#validateOccupiedTiles(user.currentArea, occupied_tiles)) {
                    throw new Error('Occupied tiles validation failed for put');
                }

                const userCatalogItem = user.inventory[userCatalogItemIndex];

                // Update item properties
                userCatalogItem.private_scene_id = user.currentArea.id;
                userCatalogItem.occupied_tiles = occupied_tiles;

                // Move item from inventory to scene
                user.inventory.splice(userCatalogItemIndex, 1);
                user.currentArea.objects.push(userCatalogItem);

                // Occupy tiles in navigation map
                occupied_tiles.forEach(tile => {
                    const [x, y] = tile;
                    if (user.currentArea.navigationMapBase[y] && user.currentArea.navigationMapBase[y][x] !== undefined) {
                        user.currentArea.navigationMapBase[y][x] = 1; // Mark as unwalkable
                    }
                });

                user.currentArea.emit(ResponseSocketsEnum.SCENE_PUT_ITEM, {
                    item: userCatalogItem
                });

                socket.emit(ResponseSocketsEnum.REMOVE_ITEM_FROM_INVENTORY, {
                    user_catalog_item_id: user_catalog_item_id
                });

                PrivateSceneApiService.putItem({
                    user_catalog_item_id: user_catalog_item_id,
                    private_scene_id: user.currentArea.id,
                    occupied_tiles: occupied_tiles
                }, user);
            }

        } catch (err) {
            console.error('Error in PutItemPrivateSceneController:', err);
            Log.error('Error in PutItemPrivateSceneController: ' + err);
            // Optionally send an error back to the client
            // socket.emit('put_item_error', { message: err.message });
        }
    }

    static #validateOccupiedTiles(currentArea, occupiedTiles, itemIdToIgnore = null) {
        const sceneObjects = currentArea.objects;
        const gameMap = currentArea.game_map; // Usar el mapa de juego original
        const rows = currentArea.map_rows;
        const cols = currentArea.map_cols;

        for (const tile of occupiedTiles) {
            const [x, y] = tile;

            // 1. Verificar límites del mapa
            if (y < 0 || y >= rows || x < 0 || x >= cols) {
                return false;
            }

            // 2. Verificar si el tile es transitable según el mapa de juego base
            if (gameMap[y][x] !== 0) {
                return false;
            }

            // 3. Verificar si está ocupado por OTRO objeto
            for (const sceneObject of sceneObjects) {
                if (itemIdToIgnore && sceneObject.id === itemIdToIgnore) {
                    continue; // No comprobar colisión con el objeto que se está moviendo
                }
                if (sceneObject.occupied_tiles.some(t => t[0] === x && t[1] === y)) {
                    return false; // Ocupado por otro objeto
                }
            }
        }

        return true;
    }
}

module.exports = PutItemPrivateSceneController;