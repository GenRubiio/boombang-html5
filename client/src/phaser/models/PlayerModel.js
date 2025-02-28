import OverheadChatAnimation from "../public-area-scene/animations/OverheadChatAnimation.js";
export default class PlayerModel {
    constructor(data, spritePlayer, spriteShadow, playerContainer, gameScene) {
        this.socketId = data.id;
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
    }
}