export default class PlayerModel {
    constructor(playerData, spritePlayer, spriteShadow, playerContainer, gameScene) {
        this.socketId = playerData.id;
        this.username = playerData.username;
        this.position = {
            x: playerData.x,
            y: playerData.y,
            z: playerData.z
        };
        this.avatar_id = playerData.avatar_id;
        this.animations = playerData.animations;
        this.sprite_player = spritePlayer;
        this.sprite_shadow = spriteShadow;
        this.playerContainer = playerContainer;
        this.uppercuts_send = playerData.uppercutsSend,
        this.uppercuts_received = playerData.uppercutsReceived,
        this.ring_wins = 0;
    }
}