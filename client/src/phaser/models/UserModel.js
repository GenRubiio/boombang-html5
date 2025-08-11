export default class UserModel {
    constructor(row, spriteAvatar, spriteShadow, containerUser) {
        this.socketId = row.id;
        this.username = row.username;
        this.description = row.description;
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
        this.gold_coins = row.gold_coins;
        this.silver_coins = row.silver_coins;
        this.rings_won = row.rings_won;
        this.coconuts_caught = row.coconuts_caught;
        this.uppercuts_send = row.uppercutsSend;
        this.uppercuts_received = row.uppercutsReceived;
        this.coconuts_sent = row.coconutsSent;
        this.coconuts_received = row.coconutsReceived;
    }
}