const ApiService = require('./ApiService');

class IslandApiService {
    static async getFavorites(user) {
        try {
            return await ApiService.post('api/islands/favorites', [], user.authJwt);
        } catch (error) {
            console.error('Error al obtener las islas favoritas:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async getAll(user) {
        try {
            return await ApiService.post('api/islands/get', [], user.authJwt);
        } catch (error) {
            console.error('Error al obtener todas las islas:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async getByUuids(uuids, user) {
        try {
            return await ApiService.post('api/islands/get-by-uuids', uuids, user.authJwt);
        } catch (error) {
            console.error('Error al obtener islas por UUIDs:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async createIsland(islandData, user) {
        try {
            return await ApiService.post('api/island/create', islandData, user.authJwt);
        } catch (error) {
            console.error('Error al crear la isla:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = IslandApiService;