const ApiService = require('./ApiService');

class BotApiService {
    /**
     * Check if bot can reply (quota + cooldown)
     */
    static async canReply(botId, userId) {
        try {
            const data = {
                bot_id: botId,
                user_id: userId
            };
            return await ApiService.post('api/bot/allow-reply', data);
        } catch (error) {
            console.error('Error checking bot can reply:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Generate bot response
     */
    static async generateResponse(botId, userId, message, language) {
        try {
            const data = {
                bot_id: botId,
                user_id: userId,
                message: message,
                language: language
            };
            return await ApiService.post('api/bot/generate', data);
        } catch (error) {
            console.error('Error generating bot response:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Save a bot message
     */
    static async saveMessage(senderType, senderId, content, language = null, metadata = null) {
        try {
            const data = {
                sender_type: senderType,
                sender_id: senderId,
                content: content,
                language: language,
                metadata: metadata
            };
            return await ApiService.post('api/bot/messages', data);
        } catch (error) {
            console.error('Error saving bot message:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Get messages for a bot-user conversation
     */
    static async getConversation(botId, userId, limit = 50) {
        try {
            const params = {
                bot_id: botId,
                user_id: userId,
                limit: limit
            };
            return await ApiService.get('api/bot/messages', params);
        } catch (error) {
            console.error('Error getting bot conversation:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Get context for bot response
     */
    static async getContext(botId, userId) {
        try {
            const params = {
                bot_id: botId,
                user_id: userId
            };
            return await ApiService.get('api/bot/context', params);
        } catch (error) {
            console.error('Error getting bot context:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Consume bot quota
     */
    static async consumeQuota(botId) {
        try {
            const data = {
                bot_id: botId
            };
            return await ApiService.post('api/bot/consume', data);
        } catch (error) {
            console.error('Error consuming bot quota:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    /**
     * Get AI provider statistics
     */
    static async getAIStats() {
        try {
            return await ApiService.get('api/bot/ai/stats');
        } catch (error) {
            console.error('Error getting AI stats:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = BotApiService;