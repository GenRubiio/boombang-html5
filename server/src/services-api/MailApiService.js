const ApiService = require('./ApiService');

class MailApiService {
    /**
     * Obtiene la lista de correos de un usuario
     * @param {Object} user - Objeto de usuario con authJwt
     * @returns {Promise} Respuesta de la API
     */
    static async getInbox(user) {
        try {
            const response = await ApiService.post('api/lobby/mail/inbox', {}, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al obtener los correos del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Marca un correo como leído
     * @param {Object} user - Objeto de usuario con authJwt
     * @param {number} mailId - ID del correo
     * @returns {Promise} Respuesta de la API
     */
    static async markAsRead(user, mailId) {
        try {
            const response = await ApiService.post('api/lobby/mail/read', {
                mail_id: mailId,
            }, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al marcar el correo como leído:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Reclama las recompensas de un correo
     * @param {Object} user - Objeto de usuario con authJwt
     * @param {number} mailId - ID del correo
     * @returns {Promise} Respuesta de la API
     */
    static async claimReward(user, mailId) {
        try {
            const response = await ApiService.post('api/lobby/mail/claim', {
                mail_id: mailId,
            }, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al reclamar las recompensas:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Obtiene el contador de correos no leídos
     * @param {Object} user - Objeto de usuario con authJwt
     * @returns {Promise} Respuesta de la API
     */
    static async getUnreadCount(user) {
        try {
            const response = await ApiService.post('api/lobby/mail/unread-count', {}, user.authJwt);
            return response;
        } catch (error) {
            console.error('Error al obtener el contador de correos no leídos:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = MailApiService;
