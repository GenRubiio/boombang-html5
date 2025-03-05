const Resource = require('./Resource');
class UserAreaResource extends Resource {
    async transform(data) {
        return {
            id: data.socket.id,
            username: data.username,
            x: data.currentAreaPosition.x,
            y: data.currentAreaPosition.y,
            z: data.currentAreaPosition.z,
            avatar_id: data.avatarId,
            uppercuts_send: data.uppercutsSend,
            uppercuts_received: data.uppercutsReceived,
            animations: [],
        };
    }
}

module.exports = UserAreaResource;