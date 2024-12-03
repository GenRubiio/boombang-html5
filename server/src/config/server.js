const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ConsoleLogger = require('../utils/consoleLogger');
const logger = new ConsoleLogger();

module.exports = (port) => {
    const app = express();
    const server = http.createServer(app);

    // Configuración de CORS para Socket.io
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL, // URL del cliente
            methods: ['GET', 'POST'],        // Métodos permitidos
            allowedHeaders: ['Content-Type'], // Encabezados permitidos
            credentials: true,               // Permite cookies
        },
    });

    server.listen(port, () => {
        logger.log(`Server running on port ${port}`, 'success');
    });

    return { app, io };
};