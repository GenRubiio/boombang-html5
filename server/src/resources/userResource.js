const Resource = require('./resource');

class UserResource extends Resource {
    transform(data) {
        return {
            id: data.id,
            username: data.username,
        };
    }
}

module.exports = UserResource;