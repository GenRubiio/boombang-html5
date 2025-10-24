const MinigameApiService = require('../services-api/MinigameApiService');

class MinigameService {
    static async getMinigames(bearerToken) {
        try {
            const minigamesData = await MinigameApiService.getMinigames(bearerToken);
            return minigamesData;
        } catch (error) {
            console.error('Error in MinigameService.getMinigames:', error);
            throw error;
        }
    }

    static async getRanking(minigameId, weekId, page = 1, perPage = 20, bearerToken) {
        try {
            const rankingData = await MinigameApiService.getRanking(
                minigameId, 
                weekId, 
                page, 
                perPage, 
                bearerToken
            );
            return rankingData;
        } catch (error) {
            console.error('Error in MinigameService.getRanking:', error);
            throw error;
        }
    }
}

module.exports = MinigameService;