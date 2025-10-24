const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const RemoveUserFromSceneTask = require('../../tasks/RemoveUserFromSceneTask');

class DisconnectUserController {
    static async main(socket, io) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                console.log(`No user found for disconnecting socket ${socket.id}`);
                return;
            }

            console.log(`User ${user.username} disconnecting with socket ID ${socket.id}`);

            // Remover usuario de la escena actual si existe
            if (user.currentArea && typeof user.currentArea === 'object') {
                try {
                    RemoveUserFromSceneTask.main(user.currentArea, user);
                } catch (areaErr) {
                    console.error(`Error removing user ${user.username} from area:`, areaErr.message);
                }
            }

            // Limpiar datos del usuario
            try {
                if (typeof user.cleanup === 'function') {
                    user.cleanup();
                }
            } catch (cleanupErr) {
                console.error(`Error in user cleanup for ${user.username}:`, cleanupErr.message);
            }

            // Remover de la colección de usuarios conectados
            ConnectedUsersCollection.removeUser(socket.id);
            console.log(`User ${user.username} successfully disconnected`);
        } catch (err) {
            console.error('Error in DisconnectUserController:', err);
        }
    }
}

module.exports = DisconnectUserController;