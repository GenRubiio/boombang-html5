const ConnectedUsersCollection = require('../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../controllers/connection/DisconnectUserController');
const RequestSocketsEnum = require('../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.DISCONNECT, () => {
        DisconnectUserController.main(socket, io);
    });

    socket.on(RequestSocketsEnum.GET_CONNECTED_USERS, () => {
        const connectedUsers = ConnectedUsersCollection.getAll();
        socket.emit('connected_users', connectedUsers);
    });

    // Enviar un mensaje a un usuario específico
    socket.on(RequestSocketsEnum.SEND_MESSAGE, (data) => {
        const { recipientId, message } = data;
        const recipientSocketId = ConnectedUsersCollection.getSocketIdByUserId(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', { message });
        } else {
            socket.emit('error', { message: 'User not connected' });
        }
    });
};
