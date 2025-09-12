const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const SceneTypesEnum = require('../../../enums/SceneTypesEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');
const CatalogItemTypeOfBehaviorEnum = require('../../../enums/CatalogItemTypeOfBehaviorEnum');

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

                if (!this.#validateOccupiedTiles(user.currentArea, occupied_tiles, user, user_catalog_item_id, true)) {
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

                // Occupy new tiles based on behavior type
                occupied_tiles.forEach(tile => {
                    const [x, y] = tile;
                    if (user.currentArea.navigationMapBase[y] && user.currentArea.navigationMapBase[y][x] !== undefined) {
                        // WALKABLE and WALKABLE_OVERLAY items don't block navigation
                        if (itemToMove.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE || 
                            itemToMove.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY) {
                            user.currentArea.navigationMapBase[y][x] = 0; // Keep walkable
                        } else {
                            user.currentArea.navigationMapBase[y][x] = 1; // Mark as unwalkable
                        }
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

                if (!this.#validateOccupiedTiles(user.currentArea, occupied_tiles, user, user_catalog_item_id, false)) {
                    throw new Error('Occupied tiles validation failed for put');
                }

                const userCatalogItem = user.inventory[userCatalogItemIndex];

                // Update item properties
                userCatalogItem.private_scene_id = user.currentArea.id;
                userCatalogItem.occupied_tiles = occupied_tiles;

                // Move item from inventory to scene
                user.inventory.splice(userCatalogItemIndex, 1);
                user.currentArea.objects.push(userCatalogItem);

                // Occupy tiles in navigation map based on behavior type
                occupied_tiles.forEach(tile => {
                    const [x, y] = tile;
                    if (user.currentArea.navigationMapBase[y] && user.currentArea.navigationMapBase[y][x] !== undefined) {
                        // WALKABLE and WALKABLE_OVERLAY items don't block navigation
                        if (userCatalogItem.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE || 
                            userCatalogItem.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY) {
                            user.currentArea.navigationMapBase[y][x] = 0; // Keep walkable
                        } else {
                            user.currentArea.navigationMapBase[y][x] = 1; // Mark as unwalkable
                        }
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

    static #validateOccupiedTiles(currentArea, occupiedTiles, user, userCatalogItemId = null, isMove = false) {
        const sceneObjects = currentArea.objects;
        const gameMap = currentArea.game_map; // Usar el mapa de juego original
        const rows = currentArea.map_rows;
        const cols = currentArea.map_cols;

        // Find the item being placed, whether it's from inventory or being moved
        let itemBeingPlaced = null;
        if (isMove) {
            itemBeingPlaced = sceneObjects.find(obj => obj.id === userCatalogItemId);
        } else if (userCatalogItemId) {
            itemBeingPlaced = user.inventory.find(item => item.id === userCatalogItemId);
        }

        for (const tile of occupiedTiles) {
            const [x, y] = tile;

            // 1. Check map boundaries
            if (y < 0 || y >= rows || x < 0 || x >= cols) {
                return false;
            }

            // 2. Check if the tile is walkable on the base game map
            if (gameMap[y][x] !== 0) {
                return false;
            }

            // 3. Check for collision with OTHER objects
            for (const sceneObject of sceneObjects) {
                // If moving an item, skip collision check with itself
                if (isMove && sceneObject.id === userCatalogItemId) {
                    continue;
                }

                // Check if the tile is occupied by this scene object
                if (sceneObject.occupied_tiles.some(t => t[0] === x && t[1] === y)) {
                    const isExistingObjectWalkable = sceneObject.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE ||
                                                   sceneObject.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY;

                    const isItemBeingPlacedWalkable = itemBeingPlaced && 
                                                    (itemBeingPlaced.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE ||
                                                     itemBeingPlaced.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY);

                    // If the existing object is walkable (e.g., a rug)
                    if (isExistingObjectWalkable) {
                        // Prevent placing a walkable item on another walkable item (rug on rug)
                        if (isItemBeingPlacedWalkable) {
                            return false;
                        }
                        // Allow placing a non-walkable item on a walkable one (chair on rug)
                        continue;
                    }
                    
                    // Tile is occupied by a non-walkable object
                    return false;
                }
            }
        }

        return true;
    }
}

module.exports = PutItemPrivateSceneController;