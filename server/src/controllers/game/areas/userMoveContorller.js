const connectedUsersCollection = require('../../../collections/connectedUsersCollection');
const publicAreasCollection = require('../../../collections/publicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

class UserMoveContorller {
    static async main(socket, io, data) {
        try {
            let user = connectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in an area');
            }
    
            const { x: targetX, y: targetY } = data;
    
            // Validar posición objetivo
            const publicArea = publicAreasCollection.getByUid(user.currentArea.id);
            if (
                targetX < 0 || targetX >= publicArea.map_width ||
                targetY < 0 || targetY >= publicArea.map_height ||
                publicArea.game_map[targetY][targetX] !== 0
            ) {
                console.log('Posición objetivo no válida');
                socket.emit('movementDenied', { reason: 'Posición objetivo no válida' });
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

module.exports = UserMoveContorller;