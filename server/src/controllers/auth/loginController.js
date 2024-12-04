const userService = require('../../services/userService');
const connectedUsersCollection = require('../../collections/connectedUsersCollection');
const disconnectUserController = require('../connection/disconnectUserController');
const UserResource = require('../../resources/userResource');

class LoginController {
    static async main(socket, io, data) {
        const { username, password } = data;

        const user = await userService.getByUsernameAndPassword(username, password);

        if (user) {
            const connectedUser = connectedUsersCollection.getByUserId(user.id);
            if (connectedUser) {
                disconnectUserController.main(connectedUser.socket, io);
                connectedUser.socket.emit('error_critical');
            }
            user.addSocket(socket);
            connectedUsersCollection.add(socket.id, user);

            const userResource = new UserResource(user);
            socket.emit('login_success', { user: userResource.toObject() });
            console.log(`User ${username} connected with socket ID ${socket.id}`);
        } else {
            console.log(`Invalid credentials for user ${username}`);
            socket.emit('login_error', { message: 'Invalid credentials' });
        }
    }
}

module.exports = LoginController;