
const MinigameSuscribeController = require('../../../controllers/game/matchmaker/MinigameSuscribeController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io, matchMakers) => {
    socket.on(RequestSocketsEnum.MINIGAME_SUBSCRIBE, (data) => {
        MinigameSuscribeController.main(socket, io, matchMakers, data);
    });
};