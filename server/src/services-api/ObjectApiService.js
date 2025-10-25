const ApiService = require('./ApiService');

class ObjectApiService {
    static async rotate(data, user) {
        try {
            await ApiService.post('api/object/rotate', data, user.authJwt);
        } catch (error) {
            console.error('Error al rotar el item en la escena:', error.response ? error.response.data : error.message);
        }
    }
}

module.exports = ObjectApiService;