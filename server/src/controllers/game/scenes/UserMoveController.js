const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AnimationEnum = require('../../../enums/AnimationEnum');

class UserMoveController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea || user.movementBlocked || user.currentArea.movementBlocked) {
                //throw new Error('User not found or not in an area');
                return;
            }

            if (user.isActionBlocked(AnimationEnum.WALK)) {
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

            if (
                targetX < 0 || targetX >= user.currentArea.mapWidth ||
                targetY < 0 || targetY >= user.currentArea.mapHeight ||
                user.currentArea.gameMap[targetY][targetX] !== 0
            ) {
                //console.log('Posición objetivo no válida');
                user.currentArea.emit(ResponseSocketsEnum.USER_MOVE_DENIED, {
                    id: socket.id,
                })
                user.finalTarget = null; // No se puede llegar al destino
                return;
            }

            // Establecer el nuevo destino final del usuario
            user.setFinalTarget({ x: targetX, y: targetY });
        } catch (err) {
            Log.error('Error in UserMoveController:', err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserMoveController;