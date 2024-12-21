export default class PlayerModel {
    constructor(data, spritePlayer, spriteShadow, playerContainer) {
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
    }
}