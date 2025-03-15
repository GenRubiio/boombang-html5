const pool = require('../config/database');
const UserModel = require('../models/UserModel');

class UserService {
    static async getAllUsers() {
        let connection;
        try {
            connection = await pool.getConnection();
            const rows = await connection.query('SELECT * FROM users');
            return rows.map(row => new UserModel(row));
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async getByUsername(username) {
        let connection;
        try {
            connection = await pool.getConnection();
            const rows = await connection.query(
                'SELECT * FROM users WHERE name = ?',
                [username]
            );
            if (rows.length === 0) return null;
            return new UserModel(rows[0]);
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async create(username, email, password, avatar_id, avatar_colors) {
        let connection;
        try {
            connection = await pool.getConnection();
            const result = await connection.query(
                'INSERT INTO users (name, email, password, avatar_id, avatar_colors) VALUES (?, ?, ?, ?, ?)',
                [username, email, password, avatar_id, avatar_colors]
            );
            return result.insertId;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async getById(id) {
        let connection;
        try {
            connection = await pool.getConnection();
            const rows = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            if (rows.length === 0) return null;
            return new UserModel(rows[0]);
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    static async increaseUppercutSend(user) {
        user.uppercutsSend += 1;
    }

    static async increaseUppercutReceived(user) {
        user.uppercutsReceived += 1;
    }
}

module.exports = UserService;
