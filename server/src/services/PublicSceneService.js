const PublicSceneApiService = require('../services-api/PublicSceneApiService');

class PublicSceneService {
    static async userCatchItem(user, itemId) {
        // Coconut catched
        if (itemId == 2) {
            user.coconutsCaught += 1;
        }
        
        try {
            await PublicSceneApiService.userCatchItem(user, itemId);
        } catch (error) {
            console.error('Error increasing uppercut send:', error);
        }
    }
}

module.exports = PublicSceneService;
