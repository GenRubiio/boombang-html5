const axios = require('axios');
require('dotenv').config();

class ApiService {
    static async post(route, data, bearerToken = null) {
        try {
            const apiUrl = process.env.API_URL;

            const headers = {
                'X-Emulator-Token': process.env.EMULATOR_API_TOKEN
            };

            if (bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }

            const response = await axios.post(`${apiUrl}/${route}`, data, {
                headers
            });

            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    static async get(route, params = {}, bearerToken = null) {
        try {
            const apiUrl = process.env.API_URL;

            const headers = {
                'X-Emulator-Token': process.env.EMULATOR_API_TOKEN
            };

            if (bearerToken) {
                headers['Authorization'] = `Bearer ${bearerToken}`;
            }

            const response = await axios.get(`${apiUrl}/${route}`, {
                headers,
                params
            });

            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ApiService;