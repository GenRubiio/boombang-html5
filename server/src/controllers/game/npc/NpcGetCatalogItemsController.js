const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const NpcApiService = require('../../../services-api/NpcApiService');

class NpcGetCatalogItemsController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);

            if (!user) {
                socket.emit(ResponseSocketsEnum.GET_NPC_CATALOG_ITEMS, {
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }

            if (!data.npcId) {
                socket.emit(ResponseSocketsEnum.GET_NPC_CATALOG_ITEMS, {
                    success: false,
                    message: 'ID de NPC no proporcionado',
                });
                return;
            }

            const responseData = await NpcApiService.getCatalogItems(user, data.npcId);

            //console.log('Response from API:', responseData);

            socket.emit(ResponseSocketsEnum.GET_NPC_CATALOG_ITEMS, {
                success: true,
                npc: responseData.npc || null,
                catalog_items: responseData.catalog_items || [],
            });
        } catch (err) {
            console.error('Error en NpcGetCatalogItemsController:', err);
            socket.emit(ResponseSocketsEnum.GET_NPC_CATALOG_ITEMS, {
                success: false,
                message: err.message || 'Error del servidor',
            });
        }
    }
}

module.exports = NpcGetCatalogItemsController;
