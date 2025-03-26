class UserSendChatController {
    static main(gameScene, data) {
        const userEmiter = gameScene.users[data.user_socket];
        if (!userEmiter) return;
        gameScene.chatManager.addMessage(data.message, userEmiter.username, userEmiter.sprite_player, userEmiter.avatar_id);
    }
}

export default UserSendChatController;
