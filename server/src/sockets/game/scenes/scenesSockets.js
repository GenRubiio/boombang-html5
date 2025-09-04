
const UserMoveController = require('../../../controllers/game/scenes/UserMoveController');
const UserLeaveSceneController = require('../../../controllers/game/scenes/UserLeaveSceneController');
const UserSelectUserController = require('../../../controllers/game/scenes/UserSelectUserController');
const UserSendUppercutController = require('../../../controllers/game/scenes/UserSendUppercutController');
const UserSendEmojiController = require('../../../controllers/game/scenes/UserSendEmojiController');
const UserSendChatController = require('../../../controllers/game/scenes/UserSendChatController');
const UserChangeUppercutController = require('../../../controllers/game/scenes/UserChangeUppercutController');
const UserSendCoconutController = require('../../../controllers/game/scenes/UserSendCoconutController');
const UserChangeCoconutController = require('../../../controllers/game/scenes/UserChangeCoconutController');
const UserChangeLookController = require('../../../controllers/game/scenes/UserChangeLookController');
const UserUpdateDescriptionController = require('../../../controllers/game/scenes/UserUpdateDescriptionController');
const UserChangeFichaController = require('../../../controllers/game/scenes/UserChangeFichaController');
const UserChangeChatController = require('../../../controllers/game/scenes/UserChangeChatController');
const UserChangeColornameController = require('../../../controllers/game/scenes/UserChangeColornameController');
const UserChangeShadowColorController = require('../../../controllers/game/scenes/UserChangeShadowColorController');
const RefreshUsersSceneChatListController = require('../../../controllers/game/scenes/RefreshUsersSceneChatListController');
const GetUserDecorationsController = require('../../../controllers/game/scenes/GetUserDecorationsController');
const InteractionRequestController = require('../../../controllers/game/interactions/InteractionRequestController');
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
    socket.on(RequestSocketsEnum.USER_SEND_UPPERCUT, () => {
        UserSendUppercutController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.USER_SEND_EMOJI, (data) => {
        UserSendEmojiController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_SEND_CHAT, (data) => {
        UserSendChatController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_CHANGE_UPPERCUT, (data) => {
        UserChangeUppercutController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_SEND_COCONUT, () => {
        UserSendCoconutController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.USER_CHANGE_COCONUT, (data) => {
        UserChangeCoconutController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.CHANGE_LOOK, (data) => {
        UserChangeLookController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_UPDATE_DESCRIPTION, (data) => {
        UserUpdateDescriptionController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_CHANGE_FICHA, (data) => {
        UserChangeFichaController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_CHANGE_CHAT, (data) => {
        UserChangeChatController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_CHANGE_NAME_COLOR, (data) => {
        UserChangeColornameController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_CHANGE_SHADOW_COLOR, (data) => {
        UserChangeShadowColorController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.REFRESH_USERS_SCENE_CHAT_LIST, (data) => {
        RefreshUsersSceneChatListController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_USER_DECORATIONS, (data) => {
        GetUserDecorationsController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_SEND_INTERACTION, (data) => {
        InteractionRequestController.send(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_ACCEPT_INTERACTION, (data) => {
        InteractionRequestController.accept(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_REJECT_INTERACTION, (data) => {
        InteractionRequestController.reject(socket, io, data);
    });
    socket.on(RequestSocketsEnum.USER_CANCEL_INTERACTION, (data) => {
        InteractionRequestController.cancel(socket, io, data);
    });
};