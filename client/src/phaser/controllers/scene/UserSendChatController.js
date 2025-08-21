import UserChatAnimation from "../../animations/UserChatAnimation.js";
class UserSendChatController {
    static main(gameScene, data) {
        const userEmiter = gameScene.users[data.user_socket];
        if (!userEmiter) return;
        UserChatAnimation.main(userEmiter, data.animation);
        gameScene.chatManager.addMessage(
            data.message,
            data.username,
            userEmiter.spriteAvatar,
            data.avatarId,
            data.chat_color
        );
    }
}

export default UserSendChatController;
