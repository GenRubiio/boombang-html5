
const UserMoveController = require('../../../controllers/game/scenes/UserMoveController');
const UserLeaveSceneController = require('../../../controllers/game/scenes/UserLeaveSceneController');
const UserSelectUserController = require('../../../controllers/game/scenes/UserSelectUserController');
const UserSendUppercutController = require('../../../controllers/game/scenes/UserSendUppercutController');
const UserSendEmojiController = require('../../../controllers/game/scenes/UserSendEmojiController');
const UserSendChatController = require('../../../controllers/game/scenes/UserSendChatController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.USER_MOVE, (data) => {
        UserMoveController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_LEAVE_AREA, () => {
        UserLeaveSceneController.main(socket, io);
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