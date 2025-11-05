const ApiService = require('./ApiService');

class NpcApiService {
    /**
     * Obtiene los objetos disponibles de un NPC con sus requisitos
     * @param {Object} user - Objeto de usuario con authJwt
     * @param {number} npcId - ID del NPC
     * @returns {Promise} Respuesta de la API
     */
    static async getCatalogItems(user, npcId) {
        try {
            const response = await ApiService.post('api/npc/catalog-items', {
                npc_id: npcId,
            }, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al obtener los objetos del NPC:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Verifica si el usuario cumple con los requisitos para reclamar un objeto
     * @param {Object} user - Objeto de usuario con authJwt
     * @param {number} catalogItemId - ID del objeto del catálogo
     * @returns {Promise} Respuesta de la API
     */
    static async checkRequirements(user, catalogItemId) {
        try {
            const response = await ApiService.post('api/npc/check-requirements', {
                catalog_item_id: catalogItemId,
            }, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al verificar los requisitos:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Reclama un objeto del NPC
     * @param {Object} user - Objeto de usuario con authJwt
     * @param {number} catalogItemId - ID del objeto del catálogo
     * @returns {Promise} Respuesta de la API
     */
    static async claimItem(user, catalogItemId) {
        try {
            const response = await ApiService.post('api/npc/claim-item', {
                catalog_item_id: catalogItemId,
            }, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al reclamar el objeto:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = NpcApiService;
