const ObjectApiService = require('../services-api/ObjectApiService');
class ObjectService {
    static async rotate(data, user) {
        try {
            await ObjectApiService.rotate(data, user);
        } catch (error) {
            console.error('Error al rotar el item en la escena:', error.response ? error.response.data : error.message);
        }
    }
}

module.exports = ObjectService;
