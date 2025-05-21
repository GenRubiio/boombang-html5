const Resource = require('./Resource');

class UserResource extends Resource {
    transform(data) {
        return {
            socket_id: data.socket.id,
            username: data.username,
            is_admin: false,
            is_vip: false,
            avatar_id: data.avatarId,
            gender: "man",
            uppercuts_send: data.uppercutsSend,
            uppercuts_received: data.uppercutsReceived,
            user: {
                uppercut_level: data.uppercutLevel,
                uppercut_selected: data.uppercutSelected,
            }
        };
    }
}

module.exports = UserResource;