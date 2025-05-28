const ApiService = require('./ApiService');

class MinigameSceneApiService {
    static get() {
        try {
            return ApiService.post('api/minigame-scene/get', []);
        } catch (error) {
            console.error('Error al obtener la escena minigame:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = MinigameSceneApiService;