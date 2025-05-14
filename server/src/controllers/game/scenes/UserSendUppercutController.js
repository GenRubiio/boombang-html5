const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');
const AnimationEnum = require('../../../enums/AnimationEnum');
const UserService = require('../../../services/UserService');

class UserSendUppercutController {
    static async main(socket, io) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) return;//throw new Error('User not found or not in any area');
            if (!user.selectedUser) return; //throw new Error('No user selected');

            const targetUser = ConnectedUsersCollection.getBySocketId(user.selectedUser.socket.id);
            if (!targetUser || targetUser.currentArea.id !== user.currentArea.id) {
                //throw new Error('Target user not found or not in the same area');
                return;
            }

            if (targetUser.motionBlocked || user.motionBlocked) {
                return; // No se puede hacer uppercut si el usuario está bloqueado
            }

            if ((targetUser.currentAreaPosition.x === targetUser.currentArea.startPosition.x
                && targetUser.currentAreaPosition.y === targetUser.currentArea.startPosition.y)
                || (user.currentAreaPosition.x === user.currentArea.startPosition.x
                    && user.currentAreaPosition.y === user.currentArea.startPosition.y)
            ) {
                return; // No se puede hacer uppercut en la posición de entrada de sala
            }

            // Aquí NO revisamos si finalTarget es null, ya que queremos permitir el uppercut en movimiento.
            const deltaX = user.currentAreaPosition.x - targetUser.currentAreaPosition.x;
            const deltaY = user.currentAreaPosition.y - targetUser.currentAreaPosition.y;

            // Comprobar si la posición es la adecuada para el uppercut (ajusta la lógica a tu juego)
            if ((deltaX === -1 && deltaY === 1) || (deltaX === 1 && deltaY === -1)) {
                if (!user.isActionBlocked(AnimationEnum.UPPERCUT) && !targetUser.isActionBlocked(AnimationEnum.UPPERCUT)) {
                    // Cancelar movimiento actual de ambos (opcional, si corresponde a tu lógica)
                    user.cancelMovement();
                    targetUser.cancelMovement();

                    // Bloquear acciones para uppercut
                    UserBlockActionsTask.blockByUppercutSend(user);
                    UserBlockActionsTask.blockByUppercutReceive(targetUser, io);

                    UserService.increaseUppercutSend(user);
                    UserService.increaseUppercutReceived(targetUser);

                    // Emitir el uppercut sin esperar que estén quietos
                    user.currentArea.emit(ResponseSocketsEnum.USER_SEND_UPPERCUT, {
                        attacker: user.socket.id,
                        receiver: targetUser.socket.id,
                        direction: (deltaX === -1 && deltaY === 1) ? 'right' : 'left',
                    });

                    //console.log(`Uppercut realizado entre ${user.id} y ${targetUser.id}`);
                }
            }

        } catch (err) {
            Log.error('Error in SendUppercutController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserSendUppercutController;