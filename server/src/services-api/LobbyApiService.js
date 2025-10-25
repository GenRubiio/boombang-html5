const ApiService = require('./ApiService');

class LobbyApiService {
    static gachaponSpin(user) {
        try {
            return ApiService.post('api/lobby/gachapon/spin', [], user.authJwt);
        } catch (error) {
            console.error('Error al obtener la escena pública:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static getGachaponPrizes(user) {
        try {
            return ApiService.post('api/lobby/gachapon/prizes', [], user.authJwt);
        } catch (error) {
            console.error('Error al obtener los premios de Gachapon:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static updateSettingsName(user, data) {
        try {
            return ApiService.post('api/lobby/settings/update-name', data, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar el nombre de usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static updateSettingsLang(user, data) {
        try {
            return ApiService.post('api/lobby/settings/update-lang', data, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar el idioma:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static updateSettingsGraphics(user, data) {
        try {
            return ApiService.post('api/lobby/settings/update-graphics', data, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar la configuración gráfica:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static updateSettingsSounds(user, data) {
        try {
            return ApiService.post('api/lobby/settings/update-sounds', data, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar la configuración de sonido:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = LobbyApiService;