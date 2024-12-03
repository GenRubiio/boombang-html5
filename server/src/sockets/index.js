const authSockets = require('./authSockets');
const connectionSockets = require('./connectionSockets');
const publicAreaSockets = require('./game/areas/publicAreaSockets');
const areaSockets = require('./game/areas/areaSockets');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A player connected:', socket.id);

        authSockets(socket, io);
        connectionSockets(socket, io);
        publicAreaSockets(socket, io);
        areaSockets(socket, io);
    });
};