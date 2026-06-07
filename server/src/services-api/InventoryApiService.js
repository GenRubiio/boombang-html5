const ApiService = require('./ApiService');

class InventoryApiService {
    /**
     * Obtiene el inventario del usuario autenticado
     * @param {Object} user - Objeto de usuario con authJwt
     * @returns {Promise} Respuesta de la API
     */
    static async getUserInventory(user) {
        try {
            const response = await ApiService.post('api/inventory/get-user-inventory', {}, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al obtener el inventario del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = InventoryApiService;
