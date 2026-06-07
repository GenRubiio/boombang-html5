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

            // Si la respuesta tiene la estructura exitosa con data.data, devolverla
            if (response.data.data) {
                return response.data.data;
            }
            
            // Si no, devolver directamente response.data (para casos de error)
            return response.data;
        } catch (error) {
            // Si axios captura un error HTTP (4xx, 5xx), intentar extraer los datos de error
            if (error.response && error.response.data) {
                return {
                    ...error.response.data,
                    statusCode: error.response.status
                };
            }
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

            // Si la respuesta tiene la estructura exitosa con data.data, devolverla
            if (response.data.data) {
                return response.data.data;
            }

            // Si no, devolver directamente response.data (para casos de error)
            return response.data;
        } catch (error) {
            // Si axios captura un error HTTP (4xx, 5xx), intentar extraer los datos de error
            if (error.response && error.response.data) {
                return {
                    ...error.response.data,
                    statusCode: error.response.status
                };
            }
            throw error;
        }
    }
}

module.exports = ApiService;