const axios = require('axios');
require('dotenv').config();

class UserApiService {
    static async login(username, password) {
        try {
            const apiUrl = process.env.API_URL;
            const data = {
                username,
                password
            };
            const response = await axios.post(`${apiUrl}/api/auth/login`, data, {
                headers: {
                    'X-Emulator-Token': process.env.EMULATOR_API_TOKEN
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error en el login:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = UserApiService;