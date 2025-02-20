const UserService = require('../../services/UserService');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');
const Log = require('../../utils/Log');

class RegisterController {
    static async main(socket, io, data) {
        try {
            const {
                username,
                email,
                password,
                avatar_id,
                avatar_colors
            } = data;

            const user = await UserService.getByUsername(username);

            if (user) {
                socket.emit(ResponseSocketsEnum.REGISTER_ERROR, { message: 'Username already exists' });
            } else {
                const newUserId = await UserService.create(username, email, password, avatar_id, avatar_colors);
                socket.emit(ResponseSocketsEnum.REGISTER_SUCCESS, { message: 'User created successfully' });
            }
        }
        catch (error) {
            Log.error('RegisterController.main', error);
        }
    }
}

module.exports = RegisterController;