const Resource = require('./Resource');
const PublicScenesCollection = require('../collections/PublicScenesCollection');

class PublicSceneMenuResource extends Resource {
    transform(data) {
        // Calcular usuarios totales: usuarios en esta escena + usuarios en escenas hijas
        let totalUsers = data.users.length;

        // Buscar escenas hijas (escenas con parent_id igual al id de esta escena)
        const allScenes = PublicScenesCollection.getAll();
        const childScenes = allScenes.filter(scene => scene.parent_id === data.id);

        // Sumar usuarios de las escenas hijas
        childScenes.forEach(childScene => {
            totalUsers += childScene.users.length;
        });

        return {
            uuid: data.uuid,
            id: data.id,
            name: data.name,
            type: data.type,
            total_users_in: totalUsers
        };
    }
}

module.exports = PublicSceneMenuResource;