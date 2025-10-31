const ApiService = require('./ApiService');

class PrivateSceneConfigApiService {
    static async getAll(user) {
        try {
            return await ApiService.post('api/private-scene-config', {}, user.authJwt);
        } catch (error) {
            console.error('Error al obtener las configuraciones de escenas privadas:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async getById(id, user) {
        try {
            return await ApiService.post(`api/private-scene-config/${id}`, {}, user.authJwt);
        } catch (error) {
            console.error('Error al obtener la configuración de escena privada:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async getByIsland(islandConfigId, user) {
        try {
            return await ApiService.post(`api/private-scene-config/by-island/${islandConfigId}`, {}, user.authJwt);
        } catch (error) {
            console.error('Error al obtener las configuraciones de escenas por isla:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = PrivateSceneConfigApiService;
