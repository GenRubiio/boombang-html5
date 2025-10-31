const ApiService = require('./ApiService');

class IslandsConfigApiService {
    static async getAll(user) {
        try {
            return await ApiService.post('api/islands-config', {}, user.authJwt);
        } catch (error) {
            console.error('Error al obtener las configuraciones de islas:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async getById(id, user) {
        try {
            return await ApiService.post(`api/islands-config/${id}`, {}, user.authJwt);
        } catch (error) {
            console.error('Error al obtener la configuración de isla:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = IslandsConfigApiService;
