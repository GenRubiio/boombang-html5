const { connectDB } = require('./src/config/database');
const server = require('./src/config/server');
const sockets = require('./src/sockets');
const { initializer } = require('./src/config/initializer');
const ConsoleLogger = require('./src/utils/consoleLogger');
const logger = new ConsoleLogger();

logger.log('Starting server...', 'success');
(async () => {
    const port = process.env.PORT || 3000;
    // Conectar a la base de datos
    await connectDB();

    // Inicializar el servidor
    const { app, io } = server(port);

    // Configurar rutas (si es necesario)
    app.get('/', (req, res) => res.send('Game Server Running'));

    // Configurar sockets
    sockets(io);
    initializer();
})();