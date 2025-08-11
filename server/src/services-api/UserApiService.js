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

    static async register(username, email, password, avatar, recaptcha) {
        try {
            const data = {
                username: username,
                email: email,
                password: password,
                avatar_id: avatar,
                recaptcha: recaptcha
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

    static async increaseStats(user, statsType) {
        try {
            const data = {
                stats_type: statsType
            };
            return await ApiService.post('api/user/increase-stats', data, user.authJwt);
        } catch (error) {
            console.error('Error al aumentar las estadísticas del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async updateDescription(user, newDescription) {
        try {
            const data = {
                description: newDescription
            };
            return await ApiService.post('api/user/update-description', data, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar la descripción del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = UserApiService;