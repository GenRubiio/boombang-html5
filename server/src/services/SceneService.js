const SceneApiService = require('../services-api/SceneApiService');
class SceneService {
    static async userDecorations(user) {
        try {
            return await SceneApiService.userDecorations(user);
        } catch (error) {
            throw error;
        }
    }

    static async userAvatars(user) {
        try {
            return await SceneApiService.userAvatars(user);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SceneService;
