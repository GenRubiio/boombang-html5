const authSockets = require('./authSockets');
const connectionSockets = require('./connectionSockets');
const publicScenesSockets = require('./game/scenes/publicScenesSockets');
const scenesSockets = require('./game/scenes/scenesSockets');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A player connected:', socket.id);

        authSockets(socket, io);
        connectionSockets(socket, io);
        publicScenesSockets(socket, io);
        scenesSockets(socket, io);
    });
};