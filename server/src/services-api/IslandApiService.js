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

    static async joinIsland(islandData, user) {
        try {
            return await ApiService.post('api/island/join', islandData, user.authJwt);
        } catch (error) {
            console.error('Error al unirse a la isla:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async getByIds(ids, user) {
        try {
            return await ApiService.post('api/islands/get-by-ids', ids, user.authJwt);
        } catch (error) {
            console.error('Error al obtener islas por IDs:', error.response ? error.response.data : error.message);
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

    static async updateName(islandData, user) {
        try {
            return await ApiService.post('api/island/update-name', islandData, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar el nombre de la isla:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async updateDescription(islandData, user) {
        try {
            return await ApiService.post('api/island/update-description', islandData, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar la descripción de la isla:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async searchIslands(searchData, user) {
        try {
            return await ApiService.post('api/islands/search', searchData, user.authJwt);
        } catch (error) {
            console.error('Error al buscar islas:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async delete(islandData, user) {
        try {
            return await ApiService.post('api/island/delete', islandData, user.authJwt);
        } catch (error) {
            console.error('Error al eliminar la isla:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = IslandApiService;