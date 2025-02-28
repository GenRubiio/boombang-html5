class UserSendChatController {
    static main(gameScene, data) {
        const userEmiter = gameScene.players[data.user_socket];
        if (!userEmiter) return;
        userEmiter.chatManager.addMessage(data.message, userEmiter.username);
    }
}

export default UserSendChatController;
