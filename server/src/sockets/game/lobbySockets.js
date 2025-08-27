
const GachaSpinController = require('../../controllers/game/lobby/GachaSpinController');
const GachaGetPrizesController = require('../../controllers/game/lobby/GachaGetPrizesController');
const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.LOBBY_GACHA_SPIN, (data) => {
        GachaSpinController.main(socket, io, data);
    });

    socket.on(RequestSocketsEnum.GET_GACHA_PRIZES, (data) => {
        GachaGetPrizesController.main(socket, io, data);
    });
};