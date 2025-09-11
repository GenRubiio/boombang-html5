const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const SceneTypesEnum = require('../../../enums/SceneTypesEnum');
const AnimationEnum = require('../../../enums/AnimationEnum');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');

class InteractionRequestController {
    static send(socket, io, data) {
        const enabledInteractions = ['drink', 'kiss', 'rose'];

        if (!enabledInteractions.includes(data.type)) {
            return;
        }

        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (!user || !user.currentArea) {
            return;
        }

        const targetUser = ConnectedUsersCollection.getBySocketId(data.targetUser);
        if (!targetUser || !targetUser.currentArea || user.currentArea != targetUser.currentArea) {
            return;
        }

        if (
            user.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
            || targetUser.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
        ) {
            return;
        }

        if (user.currentArea.hasInteraction(user.id, targetUser.id)) {
            return;
        }

        user.currentArea.addInteraction(user.id, targetUser.id, data.type);

        // Notify target user about the interaction request
        targetUser.emit(ResponseSocketsEnum.USER_RECEIVE_INTERACTION, {
            type: data.type,
            fromUser: socket.id,
        });
    }

    static cancel(socket, io, data) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (!user || !user.currentArea) {
            return;
        }

        const targetUser = ConnectedUsersCollection.getBySocketId(data.targetUser);
        if (!targetUser || !targetUser.currentArea || user.currentArea !== targetUser.currentArea) {
            return;
        }

        if (
            user.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
            || targetUser.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
        ) {
            return;
        }

        user.currentArea.removeInteraction(user.id, targetUser.id);

        targetUser.emit(ResponseSocketsEnum.USER_CANCEL_INTERACTION, {
            type: data.type,
            fromUser: socket.id,
        });
    }

    static accept(socket, io, data) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (!user || !user.currentArea) {
            return;
        }

        const fromUser = ConnectedUsersCollection.getBySocketId(data.fromUser);
        if (!fromUser || !fromUser.currentArea || user.currentArea != fromUser.currentArea) {
            return;
        }

        if (
            user.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
            || fromUser.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
        ) {
            return;
        }

        if (fromUser.movementBlocked || user.movementBlocked) {
            return;
        }

        if (!fromUser.currentArea.hasInteraction(fromUser.id, user.id)) {
            return;
        }

        const deltaX = user.currentAreaPosition.x - fromUser.currentAreaPosition.x;
        const deltaY = user.currentAreaPosition.y - fromUser.currentAreaPosition.y;

        if ((deltaX === -1 && deltaY === 1) || (deltaX === 1 && deltaY === -1)) {
            const interactionType = user.currentArea.getInteractionType(fromUser.id, user.id);
            let animationEnum;
            switch (interactionType) {
                case 'kiss':
                    // Handle kiss interaction
                    animationEnum = AnimationEnum.INTERACTION_KISS;
                    break;
                case 'drink':
                    // Handle drink interaction
                    animationEnum = AnimationEnum.INTERACTION_DRINK;
                    break;
                case 'rose':
                    // Handle rose interaction
                    animationEnum = AnimationEnum.INTERACTION_ROSE;
                    break;
                default:
                    break;
            }
            if (!user.isActionBlocked(animationEnum) && !fromUser.isActionBlocked(animationEnum)) {
                // Cancelar movimiento actual de ambos (opcional, si corresponde a tu lógica)
                user.cancelMovement();
                fromUser.cancelMovement();

                // Bloquear acciones para interacción
                UserBlockActionsTask.blockByInteraction(user, interactionType);
                UserBlockActionsTask.blockByInteraction(fromUser, interactionType);

                //UserService.increaseUppercutSend(user);
                //UserService.increaseUppercutReceived(fromUser);

                user.currentArea.removeInteraction(fromUser.id, user.id);

                user.currentArea.emit(ResponseSocketsEnum.USERS_INTERACTION, {
                    receiverUser: user.socket.id,
                    senderUser: fromUser.socket.id,
                    senderDirection: (deltaX === -1 && deltaY === 1) ? 'right' : 'left',
                    receiverDirection: (deltaX === -1 && deltaY === 1) ? 'left' : 'right',
                    interactionType: interactionType
                });

                fromUser.emit(ResponseSocketsEnum.USER_SEND_INTERACTION, {
                    type: interactionType,
                    user: socket.id,
                    action: "cancel"
                });

                user.emit(ResponseSocketsEnum.USER_ACCEPT_INTERACTION, {
                    type: interactionType,
                    fromUser: fromUser.socket.id,
                });
            }
        }
    }

    static reject(socket, io, data) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (!user || !user.currentArea) {
            return;
        }

        const fromUser = ConnectedUsersCollection.getBySocketId(data.fromUser);
        if (!fromUser || !fromUser.currentArea || user.currentArea != fromUser.currentArea) {
            return;
        }

        if (
            user.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
            || fromUser.currentArea.scene_type == SceneTypesEnum.MINIGAME_RING
        ) {
            return;
        }

        if (!fromUser.currentArea.hasInteraction(fromUser.id, user.id)) {
            return;
        }

        user.currentArea.removeInteraction(fromUser.id, user.id);

        fromUser.emit(ResponseSocketsEnum.USER_SEND_INTERACTION, {
            type: data.type,
            user: socket.id,
            action: "cancel"
        });
    }
}

module.exports = InteractionRequestController;