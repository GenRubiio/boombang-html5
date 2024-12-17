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
            // Diferencias de coordenadas
            const deltaX = user.currentAreaPosition.x - targetUser.currentAreaPosition.x;
            const deltaY = user.currentAreaPosition.y - targetUser.currentAreaPosition.y;

            // Verificar si está a la derecha o izquierda
            if ((deltaX === -1 && deltaY === 1) || (deltaX === 1 && deltaY === -1)) {
                if (!user.isActionBlocked(AnimationEnum.UPPERCUT) && !targetUser.isActionBlocked(AnimationEnum.UPPERCUT)) {
                    // Bloquear a ambos usuarios
                    user.cancelMovement();
                    targetUser.cancelMovement();

                    UserBlockActionsTask.blockByUppercutSend(user);
                    UserBlockActionsTask.blockByUppercutReceive(targetUser);

                    // Emitir el resultado a la sala
                    //user.currentArea.emit('response:uppercut', {
                    //    attacker: user.id,
                    //    target: targetUser.id,
                    //    newTargetPosition: targetUser.currentAreaPosition,
                    //});

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