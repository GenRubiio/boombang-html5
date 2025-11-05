const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const NpcApiService = require('../../../services-api/NpcApiService');

class NpcClaimItemController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);

            if (!user) {
                socket.emit(ResponseSocketsEnum.CLAIM_NPC_ITEM, {
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }

            if (!data.catalogItemId) {
                socket.emit(ResponseSocketsEnum.CLAIM_NPC_ITEM, {
                    success: false,
                    message: 'ID de objeto no proporcionado',
                });
                return;
            }

            const responseData = await NpcApiService.claimItem(user, data.catalogItemId);

            // Verificar si la respuesta fue exitosa
            if (!responseData.success) {
                socket.emit(ResponseSocketsEnum.CLAIM_NPC_ITEM, {
                    success: false,
                    message: responseData.message || responseData.error || 'No se pudo reclamar el objeto',
                    missing_requirements: responseData.missing_requirements || [],
                });
                return;
            }

            // Actualizar los datos del usuario en memoria si es necesario
            if (responseData.user) {
                user.gold_coins = responseData.user.gold_coins;
                user.silver_coins = responseData.user.silver_coins;
            }

            socket.emit(ResponseSocketsEnum.CLAIM_NPC_ITEM, {
                success: true,
                message: responseData.message,
                item: responseData.claimed_item,
                user: {
                    gold_coins: user.gold_coins,
                    silver_coins: user.silver_coins,
                },
            });

            // Actualizar créditos en el cliente
            socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                gold: user.gold_coins,
                silver: user.silver_coins,
            });
        } catch (err) {
            console.error('Error en NpcClaimItemController:', err);
            socket.emit(ResponseSocketsEnum.CLAIM_NPC_ITEM, {
                success: false,
                message: err.message || 'Error del servidor',
            });
        }
    }
}

module.exports = NpcClaimItemController;
