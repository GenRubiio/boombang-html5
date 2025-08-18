
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');
const MinigameSuscribeController = require('../../../controllers/game/matchmaker/MinigameSuscribeController');
const GetMinigameSubscribeStatusController = require('../../../controllers/game/matchmaker/GetMinigameSubscribeStatusController');

module.exports =  (socket, io, matchMakers) => {
    socket.on(RequestSocketsEnum.MINIGAME_SUBSCRIBE, (data) => {
        //MinigameSuscribeController.main(socket, io, matchMakers, data);
    });

    socket.on(RequestSocketsEnum.GET_MINIGAME_SUBSCRIBE_STATUS, (data) => {
        GetMinigameSubscribeStatusController.main(socket, io, matchMakers, data);
    });
};
