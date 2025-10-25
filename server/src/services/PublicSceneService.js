const PublicSceneApiService = require('../services-api/PublicSceneApiService');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
class PublicSceneService {
    static async userCatchItem(user, itemId, itemName, points) {
        let updateCoins = false;
        switch (itemName) {
            case 'coconut':
                user.coconutsCaught += points;
                break;
            case 'chest_silver':
                user.silverCoins += points;
                updateCoins = true;
                break;
            case 'chest_gold':
                user.goldCoins += points;
                updateCoins = true;
                break;
        }

        if (updateCoins) {
            user.socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                gold: user.goldCoins,
                silver: user.silverCoins
            });
        }

        try {
            await PublicSceneApiService.userCatchItem(user, itemId);
        } catch (error) {
            console.error('Error increasing uppercut send:', error);
        }
    }
}

module.exports = PublicSceneService;
