const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UserResource = require('../../../resources/UserResource');
const UserService = require('../../../services/UserService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');

class UserChangeFichaController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            if (!user.fichas.includes(data.ficha)) {
                throw new Error('Invalid ficha selection');
            }

            UserService.changeFicha(user, data.ficha);

            if (!user.selectedUser) {
                user.emit(ResponseSocketsEnum.USER_SELECT_USER, {
                    selected_user: new UserResource(user).toObject(),
                    auth_user: new UserResource(user).toObject()
                });
            }
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeFichaController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeFichaController;