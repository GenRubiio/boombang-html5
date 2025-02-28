
const UserMoveController = require('../../../controllers/game/areas/UserMoveController');
const UserLeaveAreaController = require('../../../controllers/game/areas/UserLeaveAreaController');
const UserSelectUserController = require('../../../controllers/game/areas/UserSelectUserController');
const SendUppercutController = require('../../../controllers/game/areas/SendUppercutController');
const SendEmojiController = require('../../../controllers/game/areas/SendEmojiController');
const UserSendChatController = require('../../../controllers/game/areas/UserSendChatController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.USER_MOVE, (data) => {
        UserMoveController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_LEAVE_AREA, () => {
        UserLeaveAreaController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.USER_SELECT_USER, (data) => {
        UserSelectUserController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SEND_UPPERCUT, () => {
        SendUppercutController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.SEND_EMOJI, (data) => {
        SendEmojiController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SEND_CHAT, (data) => {
        UserSendChatController.main(socket, io, data);
    });
};