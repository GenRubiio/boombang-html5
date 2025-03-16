const axios = require('axios');
require('dotenv').config();

class ApiService {
    static async post(route, data) {
        try {
            const apiUrl = process.env.API_URL;
            const response = await axios.post(`${apiUrl}/${route}`, data, {
                headers: {
                    'X-Emulator-Token': process.env.EMULATOR_API_TOKEN
                }
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ApiService;