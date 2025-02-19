const Bot = require('./models/Bot');

class BotsPackage {
    static main() {
        console.log('Bots corriendo...');
        for (let i = 1; i < 12; i++) {
            new Bot(`bot${i}`, 'test');
        }
        console.log('Bots creados.');
    }
}

module.exports = BotsPackage;