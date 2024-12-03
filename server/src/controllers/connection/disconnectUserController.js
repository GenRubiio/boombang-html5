const connectedUsersCollection = require('../../collections/connectedUsersCollection');
const updatePublicAreasController = require('../game/lobby/updatePublicAreasController');

const main = async (socket, io) => {
    const user = connectedUsersCollection.getBySocketId(socket.id);
    if (user) {
        if (user.currentArea) {
            user.currentArea.removeUser(user);
            user.currentArea.emit('user_left', { userId: user.id });
            socket.leave(user.currentArea.id);
            user.setArea(null);

            updatePublicAreasController.main(io);
        }
        connectedUsersCollection.removeUser(socket.id);
        console.log(`User ${user.username} disconnected with socket ID ${socket.id}`);
    }
};

module.exports = { main };