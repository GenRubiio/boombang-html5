const Resource = require('./Resource');

class IslandResource extends Resource {
    transform(data) {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            type: data.type,
            is_uppercut_active: data.isUppercutActive,
            user_id: data.userId,
            visitors: data.visitors || 0, // Default to 0 if not provided
            scenes: data.scenes || [], // Default to empty array if not provided
            my_island: data.myIsland || false, // Default to false if not provided
            user: data.user || null
        };
    }
}

module.exports = IslandResource;