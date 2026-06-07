const MailApiService = require('../services-api/MailApiService');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');

class MailService {
    static async getInbox(user) {
        try {
            const responseData = await MailApiService.getInbox(user);
            return responseData;
        } catch (error) {
            throw error;
        }
    }

    static async markAsRead(user, mailId) {
        try {
            const responseData = await MailApiService.markAsRead(user, mailId);
            return responseData;
        } catch (error) {
            throw error;
        }
    }

    static async claimReward(user, mailId) {
        try {
            const responseData = await MailApiService.claimReward(user, mailId);
            return responseData;
        } catch (error) {
            throw error;
        }
    }

    static async getUnreadCount(user) {
        try {
            const responseData = await MailApiService.getUnreadCount(user);
            return responseData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = MailService;
