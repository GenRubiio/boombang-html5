const GetMinigamesController = require('../../controllers/game/minigames/GetMinigamesController');
const GetMinigameRankingController = require('../../controllers/game/minigames/GetMinigameRankingController');
const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_MINIGAMES, (data) => {
        GetMinigamesController.main(socket, io, data);
    });

    socket.on(RequestSocketsEnum.GET_MINIGAME_RANKING, (data) => {
        GetMinigameRankingController.main(socket, io, data);
    });
};