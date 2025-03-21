const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../connection/DisconnectUserController');
const UserResource = require('../../resources/UserResource');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');
const Log = require('../../utils/Log');
const UserApiService = require('../../services-api/UserApiService');
const UserModel = require('../../models/UserModel');

class LoginController {
    static async main(socket, io, data) {
        try {
            const { username, password } = data;
            const auth = await UserApiService.login(username, password);
            if (!auth.success){
                socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Invalid credentials' });
                return;
            }
            const user = new UserModel(auth.user);

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
                //console.log(`User ${username} connected with socket ID ${socket.id}`);
            } else {
                //console.log(`Invalid credentials for user ${username}`);
                socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Invalid credentials' });
            }
        }
        catch (error) {
            socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Invalid credentials' });
            Log.error('LoginController.main', error);
        }
    }
}

module.exports = LoginController;