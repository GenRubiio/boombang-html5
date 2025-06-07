const ApiService = require('./ApiService');

class UserApiService {
    static async login(username, password) {
        try {
            const data = {
                username: username,
                password: password
            };
            return await ApiService.post('api/auth/login', data);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                return error.response.data;
            }
            console.error('Error en el login:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async register(username, email, password, avatar) {
        try {
            const data = {
                username: username,
                email: email,
                password: password,
                avatar_id: avatar,
            };
            return await ApiService.post('api/auth/register', data);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                return error.response.data;
            }
            console.error('Error en el registro:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async increaseStats(userId, statsType) {
        try {
            const data = {
                user_id: userId,
                stats_type: statsType
            };
            return await ApiService.post('api/user/increase-stats', data);
        } catch (error) {
            console.error('Error al aumentar las estadísticas del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = UserApiService;