const ApiService = require('./ApiService');

class SceneApiService {
    static userDecorations(user) {
        try {
            return ApiService.post('api/scene/user-decorations', [], user.authJwt);
        } catch (error) {
            console.error('Error al obtener las decoraciones del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = SceneApiService;