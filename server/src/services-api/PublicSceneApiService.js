const ApiService = require('./ApiService');

class PublicSceneApiService {
    static get() {
        try {
            return ApiService.post('api/public-scene/get', []);
        } catch (error) {
            console.error('Error al obtener la escena pública:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = PublicSceneApiService;