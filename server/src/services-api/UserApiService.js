const ApiService = require('./ApiService');

class UserApiService {
    static async login(username, password) {
        try {
            const data = {
                username,
                password
            };
            return ApiService.post('api/auth/login', data);
        } catch (error) {
            console.error('Error en el login:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = UserApiService;