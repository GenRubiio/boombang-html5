import OverheadChatAnimation from "../public-area-scene/animations/OverheadChatAnimation.js";
export default class PlayerModel {
    constructor(data, spritePlayer, spriteShadow, playerContainer, gameScene) {
        this.socketId = data.id;
        this.username = data.username;
        this.position = {
            x: data.x,
            y: data.y,
            z: data.z
        };
        this.avatar_id = data.avatar_id;
        this.animations = data.animations;
        this.sprite_player = spritePlayer;
        this.sprite_shadow = spriteShadow;
        this.playerContainer = playerContainer;
        this.chatManager = new OverheadChatAnimation(gameScene, spritePlayer, data.avatar_id);
        this.send_uppercuts = 200;
        this.received_uppercuts = 200;
        this.ring_wins = 0;
    }
}