const UserService = require('../../services/UserService');
const CreateUserAnimationsTask = require('../../tasks/CreateUserAnimationsTask');

class RegisterController {
    static async main(socket, io, data) {
        const {
            username,
            email,
            password,
            avatar_id,
            avatar_colors
        } = data;

        const user = await UserService.getByUsername(username);

        if (user) {
            socket.emit('register_error', { message: 'Username already exists' });
        } else {
            const newUserId = await UserService.create(username, email, password, avatar_id, avatar_colors);
            await CreateUserAnimationsTask.main(newUserId, avatar_id, [
                {
                    color_search: '5c1313',
                    new_color: '0ddefc'
                },
                {
                    color_search: 'fff478',
                    new_color: 'ff0000'
                }
            ]);
            socket.emit('register_success', { message: 'User created successfully' });
        }
    }
}

module.exports = RegisterController;