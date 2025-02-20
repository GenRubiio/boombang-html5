const fs = require('fs');
const path = require('path');

class Log {
    static logDir = path.join(__dirname, '..', 'storage', 'logs');

    static getLogFilePath() {
        const date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        return path.join(this.logDir, `${date}.log`);
    }

    static ensureLogFileExists() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        const logFile = this.getLogFilePath();
        if (!fs.existsSync(logFile)) {
            fs.writeFileSync(logFile, ''); // Crea el archivo vacío si no existe
        }
    }

    static writeLog(level, message) {
        this.ensureLogFileExists();
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
        fs.appendFileSync(this.getLogFilePath(), logMessage);
    }

    static info(message) {
        this.writeLog('info', message);
    }

    static error(message) {
        this.writeLog('error', message);
    }

    static warning(message) {
        this.writeLog('warning', message);
    }

    static debug(message) {
        this.writeLog('debug', message);
    }
}

module.exports = Log;
