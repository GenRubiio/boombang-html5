const ApiService = require('./ApiService');

class PrivateSceneApiService {
    static async create(sceneData, user) {
        try {
            return await ApiService.post('api/private-scene/create', sceneData, user.authJwt);
        } catch (error) {
            console.error('Error al crear la escena:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = PrivateSceneApiService;