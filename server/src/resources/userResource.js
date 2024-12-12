const Resource = require('./Resource');

class UserResource extends Resource {
    transform(data) {
        return {
            socket_id: data.socket.id,
            username: data.username,
            is_admin: false,
            is_vip: false,
            gender: "man",
        };
    }
}

module.exports = UserResource;