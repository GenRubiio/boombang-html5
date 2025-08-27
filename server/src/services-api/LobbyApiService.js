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
}

module.exports = LobbyApiService;