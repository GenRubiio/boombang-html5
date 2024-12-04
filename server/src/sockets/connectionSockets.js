const connectedUsersCollection = require('../collections/connectedUsersCollection');
const DisconnectUserController = require('../controllers/connection/DisconnectUserController');

module.exports = (socket, io) => {
    socket.on('disconnect', () => {
        DisconnectUserController.main(socket, io);
    });

    socket.on('get_connected_users', () => {
        const connectedUsers = connectedUsersCollection.getAll();
        socket.emit('connected_users', connectedUsers);
    });

    // Enviar un mensaje a un usuario específico
    socket.on('send_message', (data) => {
        const { recipientId, message } = data;
        const recipientSocketId = connectedUsersCollection.getSocketIdByUserId(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', { message });
        } else {
            socket.emit('error', { message: 'User not connected' });
        }
    });
};
