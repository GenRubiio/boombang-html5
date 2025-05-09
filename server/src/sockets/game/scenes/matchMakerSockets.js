
const MinigameSuscribeController = require('../../../controllers/game/matchmaker/MinigameSuscribeController');
const MinigameUnSuscribeController = require('../../../controllers/game/matchmaker/MinigameUnSuscribeController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io, matchMakers) => {
    socket.on('request:minigame_subscribe', (data) => {
        MinigameSuscribeController.main(socket, io, matchMakers, data);
    });
    socket.on('request:minigame_unsubscribe', async (data) => {
        MinigameUnSuscribeController.main(socket, io, matchMakers, data);
    });
};