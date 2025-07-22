const server = require('./src/config/server');
const sockets = require('./src/sockets');
const { initializer } = require('./src/config/initializer');
const ConsoleLogger = require('./src/utils/ConsoleLogger');
const logger = new ConsoleLogger();
const BotsPackage = require('./src/packages/bots/BotsPackage');

logger.log('Starting server...', 'success');
(async () => {
    const port = process.env.PORT || 3000;
    await initializer();
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