const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');
const AnimationEnum = require('../../../enums/AnimationEnum');
const CocoEffectEnum = require('../../../enums/CocoEffectEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserService = require('../../../services/UserService');
const SceneTypesEnum = require('../../../enums/SceneTypesEnum');

class UserSendCoconutController {
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

            if (
                targetUser.movementBlocked
                || targetUser.currentArea.movementBlocked
                || user.movementBlocked
            ) {
                return; // No se puede hacer coconut si el usuario está bloqueado
            }

            if (!targetUser.isActionBlocked(AnimationEnum.COCONUT)) {
                targetUser.cancelMovement();
                targetUser.currentArea.emit(ResponseSocketsEnum.USER_MOVE, {
                    id: targetUser.socket.id,
                    path: [],
                    isLastStep: true
                });

                UserBlockActionsTask.blockByCoconutReceive(targetUser, user.coconutSelected);

                if (user.currentArea.scene_type != SceneTypesEnum.MINIGAME_RING) {
                    UserService.increaseCoconutsSent(user);
                    UserService.increaseCoconutsReceived(targetUser);
                }

                let effect = CocoEffectEnum.COCO;

                switch (user.coconutSelected) {
                    case 0:
                        effect = CocoEffectEnum.COCO;
                        break;
                    case 1:
                        effect = CocoEffectEnum.SNOWBALL;
                        break;
                    case 2:
                        effect = CocoEffectEnum.SHOE;
                        break;
                    case 3:
                        effect = CocoEffectEnum.PIE;
                        break;
                    case 4:
                        effect = CocoEffectEnum.MACETA;
                        break;
                    case 5:
                        effect = CocoEffectEnum.AVISPAS;
                        break;
                    case 6:
                        effect = CocoEffectEnum.GARBAGE;
                        break;
                    case 7:
                        effect = CocoEffectEnum.SANDIA;
                        break;
                    case 8:
                        effect = CocoEffectEnum.YUNQUE;
                        break;
                    case 9:
                        effect = CocoEffectEnum.PIANO;
                        break;
                }

                targetUser.currentArea.emit('response:user_receive_effect', {
                    'user_socket': targetUser.socket.id,
                    'effect': effect,
                });
            }

        } catch (err) {
            Log.error('Error in UserSendCoconutController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserSendCoconutController;