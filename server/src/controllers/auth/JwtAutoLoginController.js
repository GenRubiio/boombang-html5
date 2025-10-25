const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../connection/DisconnectUserController');
const UserResource = require('../../resources/UserResource');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');
const Log = require('../../utils/Log');
const UserApiService = require('../../services-api/UserApiService');
const UserModel = require('../../models/UserModel');

class JwtAutoLoginController {
    static async main(socket, io, data) {
        try {
            const jwtToken = data.authJwt;
            const auth = await UserApiService.jwtAutoLogin(jwtToken);
            if (!auth.success) {
                socket.emit(ResponseSocketsEnum.JWT_AUTO_LOGIN_INVALID, { message: 'Invalid JWT token' });
                return;
            }

            const user = new UserModel(auth.user);

            // Verificar si el usuario es un bot - los bots no pueden usar auto-login JWT
            if (user && user.is_bot) {
                socket.emit(ResponseSocketsEnum.JWT_AUTO_LOGIN_INVALID, { message: 'Bot accounts cannot use JWT auto-login' });
                return;
            }

            if (user) {
                const connectedUser = ConnectedUsersCollection.getByUserId(user.id);
                if (connectedUser) {
                    DisconnectUserController.main(connectedUser.socket, io);
                    connectedUser.socket.emit('error_critical');
                }
                user.addSocket(socket);
                user.addAuthJwt(auth.token);
                ConnectedUsersCollection.add(socket.id, user);

                const userResource = new UserResource(user);
                socket.emit(ResponseSocketsEnum.LOGIN_SUCCESS, { user: userResource.toObject() });
            } else {
                socket.emit(ResponseSocketsEnum.JWT_AUTO_LOGIN_INVALID, { message: 'Invalid JWT token' });
            }
        }
        catch (error) {
            socket.emit(ResponseSocketsEnum.JWT_AUTO_LOGIN_INVALID, { message: 'An error occurred during JWT auto-login' });
            Log.error('LoginController.main', error);
        }
    }
}

module.exports = JwtAutoLoginController;