const { connectDB } = require('../config/database');
const UserModel = require('../models/UserModel');

class UserService {
    static async getAllUsers() {
        const sql = 'SELECT * FROM users';
        let connection;

        try {
            connection = await connectDB();
            const rows = await connection.query(sql);
            return rows.map(row => new UserModel(row));
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) await connection.end();
        }
    }

    static async getByUsernameAndPassword(username, password) {
        const sql = 'SELECT * FROM users WHERE name = ? AND password = ?';
        let connection;

        try {
            connection = await connectDB();
            const rows = await connection.query(sql, [username, password]);
            if (rows.length === 0) return null; // Verifica si está vacío
            const row = rows[0]; // Obtén la primera fila del resultado
            return new UserModel(row); // Devuelve la instancia de User
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) await connection.end();
        }
    };

    //getByUsername
    static async getByUsername(username) {
        const sql = 'SELECT * FROM users WHERE name = ?';
        let connection;

        try {
            connection = await connectDB();
            const rows = await connection.query(sql, [username]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new UserModel(row);
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) await connection.end();
        }
    }

    static async create(username, email, password, avatar_id, avatar_colors) {
        const sql = 'INSERT INTO users (name, email, password, avatar_id, avatar_colors) VALUES (?, ?, ?, ?, ?)';
        let connection;

        try {
            connection = await connectDB();
            const result = await connection.query(sql, [username, email, password, avatar_id, avatar_colors]);
            return result.insertId;
        }
        catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) await connection.end();
        }
    }

    static async getById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        let connection;

        try {
            connection = await connectDB();
            const rows = await connection.query(sql, [id]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new UserModel(row);
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) await connection.end();
        }
    }
}

module.exports = UserService;