const LobbyApiService = require('../services-api/LobbyApiService');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
class LobbyService {
    static async gachaponSpin(socket, user) {
        try {
            const responseData = await LobbyApiService.gachaponSpin(user);
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
            const responseData = await LobbyApiService.getGachaponPrizes(user);
            return responseData.prizes;
        } catch (error) {
            throw error;
        }
    }

    static async updateSettingsName(user, username) {
        try {
            const data = { username: username };
            const responseData = await LobbyApiService.updateSettingsName(user, data);
            return responseData;
        } catch (error) {
            throw error;
        }
    }

    static async updateSettingsLang(user, lang) {
        try {
            const data = { lang: lang };
            const responseData = await LobbyApiService.updateSettingsLang(user, data);
            return responseData;
        } catch (error) {
            throw error;
        }
    }

    static async updateSettingsGraphics(user, graphicsSettings) {
        try {
            const data = {
                'phaser_rendering_type': graphicsSettings.renderType,
                'phaser_antialias': graphicsSettings.antialias,
                'phaser_antialias_gl': graphicsSettings.antialiasGL,
                'phaser_pixel_art': graphicsSettings.pixelArt,
                'phaser_round_pixels': graphicsSettings.roundPixels,
                'phaser_power_preference': graphicsSettings.powerPreference,
            }
            const responseData = await LobbyApiService.updateSettingsGraphics(user, data);
            return responseData;
        } catch (error) {
            throw error;
        }
    }

    static async updateSettingsSounds(user, soundSettings) {
        try {
            const data = {
                'phaser_scene_sound_volume': soundSettings.sceneVolume,
                'phaser_scene_sound_muted': soundSettings.sceneSoundMuted,
            }
            const responseData = await LobbyApiService.updateSettingsSounds(user, data);
            return responseData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LobbyService;
