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

    static async join(data, user) {
        try {
            return await ApiService.post('api/private-scene/join', data, user.authJwt);
        } catch (error) {
            console.error('Error al unirse a la escena:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async removeItem(data, user) {
        try {
            await ApiService.post('api/private-scene/remove-item', data, user.authJwt);
        } catch (error) {
            console.error('Error al eliminar el item de la escena:', error.response ? error.response.data : error.message);
        }
    }

    static async putItem(data, user) {
        try {
            await ApiService.post('api/private-scene/put-item', data, user.authJwt);
        } catch (error) {
            console.error('Error al poner el item en la escena:', error.response ? error.response.data : error.message);
        }
    }

    static async updateItemPosition(data, user) {
        try {
            await ApiService.post('api/private-scene/update-item-position', data, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar la posición del item:', error.response ? error.response.data : error.message);
        }
    }
}

module.exports = PrivateSceneApiService;