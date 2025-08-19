
const RefreshCreditsUserController = require('../../controllers/game/user/RefreshCreditsUserController');
const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.REFRESH_USER_CREDITS, (data) => {
        RefreshCreditsUserController.main(socket, io, data);
    });
};