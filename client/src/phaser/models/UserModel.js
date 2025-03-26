export default class UserModel {
    constructor(row, spriteAvatar, spriteShadow, containerUser) {
        this.socketId = row.id;
        this.username = row.username;
        this.position = {
            x: row.x,
            y: row.y,
            z: row.z
        };
        this.avatarId = row.avatar_id;
        this.animations = row.animations;
        this.spriteAvatar = spriteAvatar;
        this.spriteShadow = spriteShadow;
        this.containerUser = containerUser;
        this.uppercuts_send = row.uppercutsSend,
        this.uppercuts_received = row.uppercutsReceived,
        this.ring_wins = 0;
    }
}