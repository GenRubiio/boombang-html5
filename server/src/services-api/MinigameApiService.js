const ApiService = require('./ApiService');

class MinigameApiService {
    static async getMinigames(bearerToken) {
        try {
            return await ApiService.post('api/minigames', {}, bearerToken);
        } catch (error) {
            console.error('Error getting minigames:', error);
            throw error;
        }
    }

    static async getRanking(minigameId, weekId, page = 1, perPage = 20, bearerToken) {
        try {
            return await ApiService.post('api/minigames/ranking', {
                minigame_id: minigameId,
                week_id: weekId,
                page: page,
                per_page: perPage
            }, bearerToken);
        } catch (error) {
            console.error('Error getting minigame ranking:', error);
            throw error;
        }
    }
}

module.exports = MinigameApiService;