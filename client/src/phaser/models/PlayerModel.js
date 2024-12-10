export default class PlayerModel {
    constructor(data) {
        this.socketId = data.socketId;
        this.position = data.position;
        this.animations = data.animations;
        this.sprite_player= data.sprite_player;
        this.sprite_shadow = data.sprite_shadow;
    }
}