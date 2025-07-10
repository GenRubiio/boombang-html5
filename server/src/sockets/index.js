const authSockets = require('./authSockets');
const connectionSockets = require('./connectionSockets');
const publicScenesSockets = require('./game/scenes/publicScenesSockets');
const privateScenesSockets = require('./game/scenes/privateScenesSockets');
const scenesSockets = require('./game/scenes/scenesSockets');
const islandSockets = require('./game/scenes/islandSockets');
const matchMakerSockets = require('./game/scenes/matchMakerSockets');
const MinigamesEnum = require('../enums/MinigamesEnum');
const MatchMakerInstance = require('../instances/MatchMakerInstance');

module.exports = (io) => {
    const matchMakers = {
        [MinigamesEnum.GOLDEN_RING]: new MatchMakerInstance(7),
    }

    io.on('connection', (socket) => {
        console.log('A player connected:', socket.id);

        authSockets(socket, io);
        connectionSockets(socket, io);
        publicScenesSockets(socket, io);
        scenesSockets(socket, io);
        islandSockets(socket, io);
        privateScenesSockets(socket, io);
        matchMakerSockets(socket, io, matchMakers);
    });
};