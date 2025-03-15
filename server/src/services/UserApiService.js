const axios = require('axios');
require('dotenv').config();

class UserApiService {
    static async login(username, password) {
        try {
            const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${apiUrl}/api/auth/login`, {
                username,
                password
            });
            return response.data.data;
        } catch (error) {
            console.error('Error en el login:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = UserApiService;