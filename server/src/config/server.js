const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

// This set will store the valid, short-lived bot tokens.
const authorizedBotTokens = new Set();

module.exports = (port) => {
    const app = express();
    const useHttps = process.env.APP_ENV === 'production';
    const server = useHttps
        ? https.createServer({
            key: fs.readFileSync('/etc/nginx/certs/server.boommania.com.key'),
            cert: fs.readFileSync('/etc/nginx/certs/server.boommania.com.crt'),
        }, app)
        : http.createServer(app);

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Internal endpoint for the Laravel API to pre-authorize a bot token
    app.post('/internal/add-bot-token', (req, res) => {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required.' });
        }

        logger.log(`Received token pre-authorization: ${token}`, 'info');
        authorizedBotTokens.add(token);

        // The token is valid for 30 seconds. After that, remove it.
        setTimeout(() => {
            authorizedBotTokens.delete(token);
            logger.log(`Token expired and removed: ${token}`, 'info');
        }, 30000);

        res.status(200).json({ success: true });
    });

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

    return { app, io, authorizedBotTokens };
};