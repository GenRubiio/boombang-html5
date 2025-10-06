const pool = require('../../../config/database');
const UserModel = require('../../../models/UserModel');

class BotService {
    static async getAll() {
        let connection;
        try {
            connection = await pool.getConnection();
            const rows = await connection.query('SELECT id, username, is_bot, active FROM users WHERE is_bot = 1 AND active = 1');
            return rows.map(row => {
                return {
                    id: row.id,
                    username: row.username,
                    is_bot: row.is_bot,
                    active: row.active
                };
            });
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async getBotById(botId) {
        let connection;
        try {
            connection = await pool.getConnection();
            const rows = await connection.query('SELECT id, username, is_bot, active FROM users WHERE id = ? AND is_bot = 1 AND active = 1', [botId]);
            if (rows.length === 0) {
                return null;
            }
            return {
                id: rows[0].id,
                username: rows[0].username,
                is_bot: rows[0].is_bot,
                active: rows[0].active
            };
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async isValidBot(username) {
        let connection;
        try {
            connection = await pool.getConnection();
            const rows = await connection.query('SELECT id FROM users WHERE username = ? AND is_bot = 1 AND active = 1', [username]);
            return rows.length > 0;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = BotService;
