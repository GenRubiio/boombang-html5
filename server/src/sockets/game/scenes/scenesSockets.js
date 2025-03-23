
const UserMoveController = require('../../../controllers/game/areas/UserMoveController');
const UserLeaveAreaController = require('../../../controllers/game/areas/UserLeaveAreaController');
const UserSelectUserController = require('../../../controllers/game/areas/UserSelectUserController');
const UserSendUppercutController = require('../../../controllers/game/areas/UserSendUppercutController');
const UserSendEmojiController = require('../../../controllers/game/areas/UserSendEmojiController');
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
        UserSendUppercutController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.SEND_EMOJI, (data) => {
        UserSendEmojiController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SEND_CHAT, (data) => {
        UserSendChatController.main(socket, io, data);
    });
};