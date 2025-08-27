const LobbyApiService = require('../services-api/LobbyApiService');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
class LobbyService {
    static async gachaponSpin(user) {
        try {
            let responseData = await LobbyApiService.gachaponSpin(user);
            //user = responseData.user;

            user.socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                gold: user.goldCoins,
                silver: user.silverCoins
            });

            user.socket.emit(ResponseSocketsEnum.LOBBY_GACHA_SPIN, {
                success: true,
                item: responseData.item
            });
        } catch (error) {
            throw error;
        }
    }

    static async getGachaponPrizes(user) {
        try {
            let responseData = await LobbyApiService.getGachaponPrizes(user);
            return responseData.prizes;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LobbyService;
