const authSockets = require('./authSockets');
const connectionSockets = require('./connectionSockets');
const publicScenesSockets = require('./game/scenes/publicScenesSockets');
const privateScenesSockets = require('./game/scenes/privateScenesSockets');
const scenesSockets = require('./game/scenes/scenesSockets');
const islandSockets = require('./game/scenes/islandSockets');
const matchMakerSockets = require('./game/scenes/matchMakerSockets');
const MinigamesEnum = require('../enums/MinigamesEnum');
const MatchMakerInstance = require('../instances/MatchMakerInstance');

module.exports = (io, authorizedBotTokens) => {
    const matchMakers = {
        [MinigamesEnum.GOLDEN_RING]: new MatchMakerInstance(4, io),
    }

    io.on('connection', (socket) => {
        console.log('A player connected:', socket.id);

        authSockets(socket, io, authorizedBotTokens);
        connectionSockets(socket, io);
        publicScenesSockets(socket, io);
        scenesSockets(socket, io);
        islandSockets(socket, io);
        privateScenesSockets(socket, io);
        matchMakerSockets(socket, io, matchMakers);
    });
};