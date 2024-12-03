const { connectDB } = require('../config/database');
const UserModel = require('../models/userModel');

const getAllUsers = async () => {
    const sql = 'SELECT * FROM users';
    let connection;

    try {
        connection = await connectDB();
        const rows = await connection.query(sql);
        return rows.map(row => new UserModel(row.id, row.name, row.email));
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    } finally {
        if (connection) await connection.end();
    }
};

const getByUsernameAndPassword = async (username, password) => {
    const sql = 'SELECT * FROM users WHERE name = ? AND password = ?';
    let connection;

    try {
        connection = await connectDB();
        const rows = await connection.query(sql, [username, password]);
        if (rows.length === 0) return null; // Verifica si está vacío
        const row = rows[0]; // Obtén la primera fila del resultado
        return new UserModel(row.id, row.name, row.email); // Devuelve la instancia de User
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    } finally {
        if (connection) await connection.end();
    }
};

module.exports = {
    getAllUsers,
    getByUsernameAndPassword
};
