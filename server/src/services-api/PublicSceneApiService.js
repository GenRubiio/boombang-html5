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

    static async userCatchItem(user, itemId) {
        try {
            const data = {
                item_id: itemId,
                scene_id: user.currentArea.id,
            };
            return await ApiService.post('api/public-scene/user-catch-item', data, user.authJwt);
        } catch (error) {
            console.error('Error al capturar el objeto:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = PublicSceneApiService;