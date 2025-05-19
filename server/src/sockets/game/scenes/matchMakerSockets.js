
const MinigameSuscribeController = require('../../../controllers/game/matchmaker/MinigameSuscribeController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io, matchMakers) => {
    socket.on('request:minigame_subscribe', (data) => {
        MinigameSuscribeController.main(socket, io, matchMakers, data);
    });
};