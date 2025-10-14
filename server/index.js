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
    console.error(error.stack);
    // No salir del proceso, solo registrar el error
});

process.on('unhandledRejection', (reason, promise) => {
    logger.log('Unhandled Rejection at: ' + promise + ' reason: ' + reason, 'error');
    console.error('Unhandled Rejection:', reason);
    // No salir del proceso, solo registrar el error
});

logger.log('Starting server...', 'success');
(async () => {
    const port = process.env.PORT || 3000;
    await initializer();
    
    // Inicializar el reloj del juego
    GameClock.start();
    
    // Inicializar el servidor
    const { app, io, authorizedBotTokens } = server(port);

    // Configurar rutas (si es necesario)
    app.get('/', (req, res) => res.send('Game Server Running'));

    // Configurar sockets
    sockets(io, authorizedBotTokens);

    if (process.env.RUN_BOTS ? process.env.RUN_BOTS === 'true' : false) {
        BotsPackage.main();
    }
})();