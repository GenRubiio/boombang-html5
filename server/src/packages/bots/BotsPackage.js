const Bot = require('./models/Bot');
const BotService = require('./services/BotService');
const Log = require('../../utils/Log');

class BotsPackage {
    static async main() {
        try {
            const bots = await BotService.getAll();
            bots.forEach(bot => {
                new Bot(bot.username);
            });
        } catch (error) {
            Log.error('BotsPackage.main', error);
        }
    }
}

module.exports = BotsPackage;