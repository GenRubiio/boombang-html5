const UserService = require('../../services/UserService');
const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../connection/DisconnectUserController');
const UserResource = require('../../resources/UserResource');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');

class LoginController {
    static async main(socket, io, data) {
        const { username, password } = data;

        const user = await UserService.getByUsernameAndPassword(username, password);

        if (user) {
            const connectedUser = ConnectedUsersCollection.getByUserId(user.id);
            if (connectedUser) {
                DisconnectUserController.main(connectedUser.socket, io);
                connectedUser.socket.emit('error_critical');
            }
            user.addSocket(socket);
            ConnectedUsersCollection.add(socket.id, user);

            const userResource = new UserResource(user);
            socket.emit(ResponseSocketsEnum.LOGIN_SUCCESS, { user: userResource.toObject() });
            console.log(`User ${username} connected with socket ID ${socket.id}`);
        } else {
            console.log(`Invalid credentials for user ${username}`);
            socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Invalid credentials' });
        }
    }
}

module.exports = LoginController;