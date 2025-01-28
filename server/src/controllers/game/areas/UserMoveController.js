const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AnimationEnum = require('../../../enums/AnimationEnum');

class UserMoveController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in an area');
            }

            if (user.isActionBlocked(AnimationEnum.WALK)){
                return;
            }

            const { x: targetX, y: targetY } = data;

            //validar que en la posicion no se encuentre otro usuario
            const areaUsers = user.currentArea.getUsers();
            for (let i = 0; i < areaUsers.length; i++) {
                const areaUser = areaUsers[i];
                if (areaUser.currentAreaPosition.x === targetX && areaUser.currentAreaPosition.y === targetY) {
                    return;
                }
            }

            // Validar posición objetivo
            const publicArea = PublicAreasCollection.getByUid(user.currentArea.id);
            if (
                targetX < 0 || targetX >= publicArea.map_width ||
                targetY < 0 || targetY >= publicArea.map_height ||
                publicArea.game_map[targetY][targetX] !== 0
            ) {
                console.log('Posición objetivo no válida');
                publicArea.emit(ResponseSocketsEnum.USER_MOVE_DENIED, {
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