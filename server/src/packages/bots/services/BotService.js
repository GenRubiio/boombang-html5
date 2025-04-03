const pool = require('../../../config/database');
const UserModel = require('../../../models/UserModel');

class BotService {
    static async getAll() {
        let connection;
        try {
            connection = await pool.getConnection();
            const rows = await connection.query('SELECT * FROM users WHERE is_bot = 1 AND active = 1');
            return rows.map(row => {
                return {
                    id: row.id,
                    username: row.username,
                    password: row.password,
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
}

module.exports = BotService;
