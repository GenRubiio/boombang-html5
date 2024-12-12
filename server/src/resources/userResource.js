const Resource = require('./Resource');

class UserResource extends Resource {
    transform(data) {
        return {
            username: data.username,
            is_admin: false,
            is_vip: false,
            gender: "man",
        };
    }
}

module.exports = UserResource;