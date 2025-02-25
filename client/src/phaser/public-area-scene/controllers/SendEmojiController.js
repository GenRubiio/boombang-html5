class SendEmojiController {
    static main(gameScene, data) {
        const user = gameScene.players[data.user_socket];
        const emojiId = data.emoji_id;
        const avatarId = user.avatar_id;
        if (!user || !user.currentArea) return;
    }
}

export default SendEmojiController;
