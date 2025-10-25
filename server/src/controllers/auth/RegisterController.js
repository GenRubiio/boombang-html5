const UserApiService = require('../../services-api/UserApiService');
const Log = require('../../utils/Log');
const UserModel = require('../../models/UserModel');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');
const UserResource = require('../../resources/UserResource');
const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../connection/DisconnectUserController');

class RegisterController {
    static async main(socket, io, data) {
        try {
            const response = await UserApiService.register(
                data.username,
                data.email,
                data.password,
                data.avatar_id,
                data.recaptcha,
                data.lang
            );
            if (response.errors) {
                socket.emit(ResponseSocketsEnum.REGISTER_ERROR, { errors: response.errors });
                return;
            }
            if (!response.success) {
                socket.emit(ResponseSocketsEnum.REGISTER_ERROR, { message: 'Error' });
                return;
            }
            const user = new UserModel(response.user);
            if (user) {
                const connectedUser = ConnectedUsersCollection.getByUserId(user.id);
                if (connectedUser) {
                    DisconnectUserController.main(connectedUser.socket, io);
                    connectedUser.socket.emit('error_critical');
                }
                user.addSocket(socket);
                user.addAuthJwt(response.token);
                ConnectedUsersCollection.add(socket.id, user);

                const userResource = new UserResource(user);
                socket.emit(ResponseSocketsEnum.REGISTER_SUCCESS, { user: userResource.toObject() });
            } else {
                socket.emit(ResponseSocketsEnum.REGISTER_ERROR, { message: 'Error' });
            }
        }
        catch (error) {
            Log.error('RegisterController.main', error);
            socket.emit(ResponseSocketsEnum.REGISTER_ERROR, { message: 'Error' });
        }
    }
}

module.exports = RegisterController;