const mariadb = require('mariadb');
require('dotenv').config();
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

const connectDB = async () => {
    try {
        logger.log('Connecting to MariaDB...');
        const connection = await mariadb.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        logger.log('MariaDB connected', 'success');
        return connection;
    } catch (err) {
        console.error('MariaDB connection error:', err);
        throw err;
    }
};

module.exports = { connectDB };