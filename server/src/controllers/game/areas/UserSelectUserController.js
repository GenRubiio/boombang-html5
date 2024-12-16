const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const UserMovimentUtil = require('../../../utils/UserMovimentUtil');
const UserResource = require('../../../resources/UserResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class UserSelectUserController {
    static main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in an area');
            }
            const selectedUser = ConnectedUsersCollection.getBySocketId(data.socketId);
            if (!selectedUser || !selectedUser.currentArea) {
                throw new Error('Selected user not found or not in an area');
            }
            if (user.currentArea != selectedUser.currentArea) {
                throw new Error('Selected user is not in the same area');
            }

            this.selectUser(user, selectedUser);
            this.updateUserZPositionInArea(user, selectedUser);

        } catch (err) {
            console.log(err);
            logger.log(`Error handling user movement: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
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
                selected_user: new UserResource(selectedUser).toObject()
            });
        }
    }

    static updateUserZPositionInArea(user, selectedUser) {
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