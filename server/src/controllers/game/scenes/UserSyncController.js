const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserResource = require('../../../resources/UserResource');

class UserSyncController {
    /**
     * Maneja la solicitud de sincronización de usuarios
     * Reenvía las posiciones actuales de todos los usuarios en la misma área
     */
    static main(socket, io) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (!user || !user.currentArea) {
            return;
        }

        try {
            // Obtener todos los usuarios en la misma área
            const areaUsers = user.currentArea.users.filter(areaUser => 
                areaUser.socket.id !== socket.id
            );

            // Reenviar información de posición de cada usuario
            areaUsers.forEach(areaUser => {
                const userData = new UserResource().transform(areaUser);
                
                socket.emit(ResponseSocketsEnum.USER_UPDATE_POSITION, {
                    user: userData,
                    position: {
                        x: areaUser.currentAreaPosition.x,
                        y: areaUser.currentAreaPosition.y,
                        z: areaUser.currentAreaPosition.z
                    }
                });
            });

        } catch (error) {
            // Error silencioso
        }
    }
}

module.exports = UserSyncController;