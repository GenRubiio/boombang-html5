const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');
const Log = require('../../utils/Log');
const UserApiService = require('../../services-api/UserApiService');

class LogoutController {
    static async main(socket, io, data) {
        try {
            const authToken = data.authToken;
            const auth = await UserApiService.logout(authToken);
            if (!auth.success) {
                socket.emit(ResponseSocketsEnum.LOGOUT, { message: 'Logout failed' });
                return;
            }
            socket.emit(ResponseSocketsEnum.LOGOUT, { message: 'Logout successful' });
            socket.disconnect();
        } catch (error) {
            socket.emit(ResponseSocketsEnum.LOGOUT, { message: 'Logout failed' });
            Log.error('LogoutController.main', error);
        }
    }
}

module.exports = LogoutController;