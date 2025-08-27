const SceneApiService = require('../services-api/SceneApiService');
class SceneService {
    static async userDecorations(user) {
        try {
            return await SceneApiService.userDecorations(user);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SceneService;
