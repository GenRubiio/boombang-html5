const LobbyApiService = require('../services-api/LobbyApiService');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
class LobbyService {
    static async gachaponSpin(socket, user) {
        try {
            let responseData = await LobbyApiService.gachaponSpin(user);
            user.goldCoins = responseData.user.gold_coins;
            user.silverCoins = responseData.user.silver_coins;
            user.fichas = responseData.user.fichas;
            user.chats = responseData.user.chats;
            user.shadows = responseData.user.shadows;
            user.colornames = responseData.user.colornames;

            socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                gold: user.goldCoins,
                silver: user.silverCoins
            });

            socket.emit(ResponseSocketsEnum.LOBBY_GACHA_SPIN, {
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
