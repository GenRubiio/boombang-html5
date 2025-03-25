import UserEmojiAnimation from "../animations/UserEmojiAnimation.js";

class UserSendEmojiController {
    static main(gameScene, data) {
        const user = gameScene.players[data.user_socket];
        const emojiId = data.emoji_id;
        if (!user) return;

        UserEmojiAnimation.main(user, emojiId);
    }
}

export default UserSendEmojiController;
