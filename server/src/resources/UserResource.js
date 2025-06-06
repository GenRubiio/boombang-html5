const Resource = require('./Resource');

class UserResource extends Resource {
    transform(data) {
        return {
            id: data.socket.id,
            socket_id: data.socket.id,
            username: data.username,
            is_admin: false,
            is_vip: false,
            avatar_id: data.avatarId,
            gender: "man",
            x: data.currentAreaPosition ? data.currentAreaPosition.x : null,
            y: data.currentAreaPosition ? data.currentAreaPosition.y : null,
            z: data.currentAreaPosition ? data.currentAreaPosition.z : null,
            avatar_id: data.avatarId,
            uppercuts_send: data.uppercutsSend,
            uppercuts_received: data.uppercutsReceived,
            uppercut_level: data.uppercutLevel,
            uppercut_selected: data.uppercutSelected,
            coconut_level: data.coconutLevel,
            coconut_selected: data.coconutSelected,
            animations: [],
        };
    }
}

module.exports = UserResource;