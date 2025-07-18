const authSockets = require('./authSockets');
const connectionSockets = require('./connectionSockets');
const publicScenesSockets = require('./game/scenes/publicScenesSockets');
const scenesSockets = require('./game/scenes/scenesSockets');
const matchMakerSockets = require('./game/scenes/matchMakerSockets');
const MinigamesEnum = require('../enums/MinigamesEnum');
const MatchMakerInstance = require('../instances/MatchMakerInstance');

module.exports = (io) => {
    const matchMakers = {
        [MinigamesEnum.GOLDEN_RING]: new MatchMakerInstance(3),
    }

    io.on('connection', (socket) => {
        console.log('A player connected:', socket.id);

        authSockets(socket, io);
        connectionSockets(socket, io);
        publicScenesSockets(socket, io);
        scenesSockets(socket, io);
        matchMakerSockets(socket, io, matchMakers);
    });
};