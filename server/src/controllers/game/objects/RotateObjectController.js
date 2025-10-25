const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const SceneTypesEnum = require('../../../enums/SceneTypesEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ObjectService = require('../../../services/ObjectService');

class RotateObjectController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.currentArea) return;
            if (!user.currentArea
                || user.currentArea.scene_type != SceneTypesEnum.PRIVATE_SCENE
                || user.currentArea.user_id != user.id
            ) return;

            let userCatalogItemId = data.user_catalog_item_id;
            let userCatalogItem = user.currentArea.objects.find(item => item.id == userCatalogItemId);
            if (!userCatalogItem) {
                throw new Error('Item not found in user current area');
            }

            if (userCatalogItem.private_scene_id !== user.currentArea.id) {
                throw new Error('Item does not belong to the current private scene');
            }

            userCatalogItem.rotated = !userCatalogItem.rotated;

            await ObjectService.rotate({
                user_catalog_item_id: userCatalogItem.id,
                rotated: userCatalogItem.rotated
            }, user);

            socket.emit(ResponseSocketsEnum.ROTATE_OBJECT, {
                item: userCatalogItem
            });
        } catch (err) {
            console.error('Error in RotateObjectController:', err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = RotateObjectController;