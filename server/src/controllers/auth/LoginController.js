const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../connection/DisconnectUserController');
const UserResource = require('../../resources/UserResource');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');
const Log = require('../../utils/Log');
const UserApiService = require('../../services-api/UserApiService');
const UserModel = require('../../models/UserModel');

class LoginController {
    static async main(socket, io, data, authorizedBotTokens) {
        try {
            const { username, password, bot_token } = data;

            // --- Bot Authentication Logic ---
            if (bot_token) {
                if (!authorizedBotTokens || !authorizedBotTokens.has(bot_token)) {
                    socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Invalid bot token.' });
                    socket.disconnect(); // Disconnect invalid bots immediately
                    return;
                }
                // The token is valid, consume it to prevent reuse
                authorizedBotTokens.delete(bot_token);
                
                // Para bots con token válido, obtener usuario directamente de la base de datos
                const botAuth = await UserApiService.getBotByUsername(username);
                if (!botAuth.success) {
                    socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Bot user not found' });
                    return;
                }
                
                const user = new UserModel(botAuth.user);
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
                    Log.info('LoginController.main', `Bot ${username} connected with socket ID ${socket.id}`);
                } else {
                    socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Bot authentication failed' });
                }
                return;
            }
            // --- End of Bot Authentication ---

            const auth = await UserApiService.login(username, password);

            if (!auth.success){
                socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Invalid credentials' });
                return;
            }
            const user = new UserModel(auth.user);

            // Verificar si el usuario es un bot y no tiene token de bot válido
            if (user && user.is_bot && !bot_token) {
                socket.emit(ResponseSocketsEnum.LOGIN_ERROR, { message: 'Bot accounts cannot login without a valid bot token' });
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