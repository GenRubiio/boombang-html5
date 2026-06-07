const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const NpcApiService = require('../../../services-api/NpcApiService');

class NpcCheckRequirementsController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);

            if (!user) {
                socket.emit(ResponseSocketsEnum.CHECK_NPC_REQUIREMENTS, {
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }

            if (!data.catalogItemId) {
                socket.emit(ResponseSocketsEnum.CHECK_NPC_REQUIREMENTS, {
                    success: false,
                    message: 'ID de objeto no proporcionado',
                });
                return;
            }

            const responseData = await NpcApiService.checkRequirements(user, data.catalogItemId);

            socket.emit(ResponseSocketsEnum.CHECK_NPC_REQUIREMENTS, {
                success: true,
                can_claim: responseData.can_claim,
                missing_requirements: responseData.missing_requirements || [],
            });
        } catch (err) {
            console.error('Error en NpcCheckRequirementsController:', err);
            socket.emit(ResponseSocketsEnum.CHECK_NPC_REQUIREMENTS, {
                success: false,
                message: err.message || 'Error del servidor',
            });
        }
    }
}

module.exports = NpcCheckRequirementsController;
