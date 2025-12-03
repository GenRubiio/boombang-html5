const server = require('./src/config/server');
const sockets = require('./src/sockets');
const { initializer } = require('./src/config/initializer');
const ConsoleLogger = require('./src/utils/ConsoleLogger');
const GameClock = require('./src/utils/GameClock');
const logger = new ConsoleLogger();
const BotsPackage = require('./src/packages/bots/BotsPackage');

// Manejadores de errores globales
process.on('uncaughtException', (error) => {
    logger.log('Uncaught Exception: ' + error.message, 'error');
    console.error('UNCAUGHT EXCEPTION:', error.stack);
    
    // En producción, intentar hacer limpieza gradual
    if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
            process.exit(1);
        }, 5000);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    logger.log('Unhandled Rejection at: ' + promise + ' reason: ' + reason, 'error');
    console.error('UNHANDLED REJECTION:', reason);
    
    // Si la razón es un error crítico, salir del proceso
    if (reason && reason.message && reason.message.includes('ECONNREFUSED')) {
        console.error('Database connection failed, exiting...');
        process.exit(1);
    }
});

// Manejo de señales del sistema
process.on('SIGTERM', () => {
    logger.log('SIGTERM received, shutting down gracefully', 'info');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.log('SIGINT received, shutting down gracefully', 'info');
    process.exit(0);
});

logger.log('Starting server...', 'success');
(async () => {
    const port = process.env.PORT || 3000;
    await initializer();
    
    // Inicializar el reloj del juego
    GameClock.start();
    
    // Inicializar el servidor
    const { app, io, authorizedBotTokens } = server(port);

    // Configurar middleware para JSON
    app.use(require('express').json());

    // Configurar rutas
    app.get('/', (req, res) => res.send('Game Server Running'));
    app.use('/api', require('./src/routes/apiRoutes'));

    // Configurar sockets
    sockets(io, authorizedBotTokens);

    if (process.env.RUN_BOTS ? process.env.RUN_BOTS === 'true' : false) {
        BotsPackage.main();
    }
})();