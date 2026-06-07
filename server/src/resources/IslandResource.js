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
            user: data.user || null,
            island_config: data.islandConfig || data.island_config || null // Island configuration with image info
        };
    }
}

module.exports = IslandResource;