const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');
const AnimationEnum = require('../../../enums/AnimationEnum');

class SendUppercutController {
    static async main(socket, io) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) throw new Error('User not found or not in any area');
            if (!user.selectedUser) throw new Error('No user selected');

            const targetUser = ConnectedUsersCollection.getBySocketId(user.selectedUser.socket.id);
            if (!targetUser || targetUser.currentArea.id !== user.currentArea.id) {
                throw new Error('Target user not found or not in the same area');
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

                    // Emitir el uppercut sin esperar que estén quietos
                    user.currentArea.emit(ResponseSocketsEnum.SEND_UPPERCUT, {
                        attacker: user.socket.id,
                        receiver: targetUser.socket.id,
                        direction: deltaX === -1 ? 'left' : 'right',
                    });

                    console.log(`Uppercut realizado entre ${user.id} y ${targetUser.id}`);
                }
            }

        } catch (err) {
            console.log(err);
            logger.log(`Error leaving public area: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = SendUppercutController;