const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const UserMovimentUtil = require('../../../utils/UserMovimentUtil');
const UserResource = require('../../../resources/UserResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AnimationEnum = require('../../../enums/AnimationEnum');

class UserSelectUserController {
    static main(socket, io, data) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (!user || !user.currentArea) {
            return;
        }

        const selectedUser = ConnectedUsersCollection.getBySocketId(data.socketId);
        if (!selectedUser || !selectedUser.currentArea || user.currentArea !== selectedUser.currentArea) {
            return;
        }

        this.selectUser(user, selectedUser);
        if (!user.isActionBlocked(AnimationEnum.LOOK)) {
            this.updateUserZPositionInArea(user, selectedUser);
        }
    }

    static selectUser(user, selectedUser) {
        let updateCard = false;
        if (
            (user.selectedUser && user.selectedUser.id != selectedUser.id && user.id != selectedUser.id)
            || (!user.selectedUser && user.id != selectedUser.id)
        ) {
            user.setSelectedUser(selectedUser);
            updateCard = true;
        }
        else if (user.selectedUser && user.id == selectedUser.id) {
            user.setSelectedUser(null);
            updateCard = true;
        }
        if (updateCard) {
            user.emit(ResponseSocketsEnum.USER_SELECT_USER, {
                selected_user: new UserResource(selectedUser).toObject(),
                auth_user: new UserResource(user).toObject()
            });
        }
    }

    static updateUserZPositionInArea(user, selectedUser) {
        if (user.isActionBlocked(AnimationEnum.LOOK)) {
            return;
        }
        if (!user.inMoviment()) {
            const { x: x1, y: y1 } = user.currentAreaPosition;
            const { x: x2, y: y2 } = selectedUser.currentAreaPosition;

            // Calcula la dirección usando el ángulo
            const direction = UserMovimentUtil.getLongDirection(x1, y1, x2, y2);

            user.currentAreaPosition.z = direction;
            user.currentArea.emit(ResponseSocketsEnum.USER_UPDATE_POSITION, {
                socket_id: user.socket.id,
                position: user.currentAreaPosition
            });
        }
    }
}

module.exports = UserSelectUserController;