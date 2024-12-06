const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();

class UserMoveController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in an area');
            }

            const { x: targetX, y: targetY } = data;

            // Validar posición objetivo
            const publicArea = PublicAreasCollection.getByUid(user.currentArea.id);
            if (
                targetX < 0 || targetX >= publicArea.map_width ||
                targetY < 0 || targetY >= publicArea.map_height ||
                publicArea.game_map[targetY][targetX] !== 0
            ) {
                console.log('Posición objetivo no válida');
                publicArea.emit('response:user_move_denied', {
                    id: socket.id,
                })
                user.finalTarget = null; // No se puede llegar al destino
                return;
            }

            // Establecer el nuevo destino final del usuario
            user.setFinalTarget({ x: targetX, y: targetY });
        } catch (err) {
            console.log(err);
            logger.log(`Error handling user movement: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserMoveController;