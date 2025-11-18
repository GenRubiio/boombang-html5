const ApiService = require('./ApiService');

class ShopApiService {
    /**
     * Obtiene el catálogo de la tienda
     * @param {Object} user - Objeto de usuario con authJwt
     * @returns {Promise} Respuesta de la API
     */
    static async getCatalog(user) {
        try {
            const response = await ApiService.post('api/shop/catalog', {}, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al obtener el catálogo de la tienda:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Compra un item del catálogo
     * @param {Object} user - Objeto de usuario con authJwt
     * @param {number} catalogItemId - ID del item del catálogo
     * @param {number} quantity - Cantidad a comprar
     * @returns {Promise} Respuesta de la API
     */
    static async purchaseItem(user, catalogItemId, quantity = 1) {
        try {
            const response = await ApiService.post('api/shop/purchase', {
                catalog_item_id: catalogItemId,
                quantity: quantity,
            }, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al comprar el item:', error.response ? error.response.data : error.message);

            // Si la API devuelve un error estructurado, lo retornamos
            if (error.response && error.response.data) {
                return {
                    success: false,
                    error: error.response.data.error || error.response.data.message || 'Error al comprar el item',
                };
            }

            throw error;
        }
    }
}

module.exports = ShopApiService;
