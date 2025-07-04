const ApiService = require('./ApiService');

class GameSceneApiService {
    static get() {
        try {
            return ApiService.post('api/game-scene/get', []);
        } catch (error) {
            console.error('Error al obtener la escena del juego:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = GameSceneApiService;