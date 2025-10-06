const { io } = require("socket.io-client");
require('dotenv').config();
const axios = require('axios');
const ApiService = require('../../../services-api/ApiService');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class Bot {
    constructor(username) {
        this.username = username;
        this.socket = null;
        this.jwtToken = null;
        this.uppercutInterval = null;
        this.api_url = process.env.API_URL;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000; // 5 segundos

        this.authenticateAndConnect();
    }

    async authenticateAndConnect() {
        try {
            console.log(`Bot ${this.username}: Obteniendo token de autenticación...`);
            
            // Paso 1: Obtener bot token para la conexión socket
            const tokenResponse = await axios.post(`${this.api_url}/api/internal/bots/generate-token`, {
                username: this.username
            });
            
            const { token: botToken } = tokenResponse.data;

            if (!botToken) {
                throw new Error('No se pudo obtener el bot token.');
            }

            // Paso 2: Obtener JWT token de Laravel para llamadas HTTP
            console.log(`Bot ${this.username}: Obteniendo JWT token...`);
            const authData = await ApiService.post('api/auth/bot-login', {
                username: this.username
            });

            console.log(`Bot ${this.username}: Respuesta del bot-login:`, authData);

            if (!authData.token) {
                console.error(`Bot ${this.username}: Error en bot-login - no se recibió token`);
                throw new Error('No se pudo obtener el JWT token.');
            }

            this.jwtToken = authData.token;
            console.log(`Bot ${this.username}: JWT token obtenido exitosamente`);
            
            console.log(`Bot ${this.username}: Tokens obtenidos. Conectando al servidor...`);
            this.socket = io(process.env.EMULATOR_URL);
            this.initializeSocketEvents(botToken);
            this.reconnectAttempts = 0; // Reset counter on successful connection

        } catch (error) {
            console.error(`Error al autenticar el bot ${this.username}:`, error.message);
            if (error.response) {
                console.error(`Response data:`, error.response.data);
            }
            this.handleReconnection();
        }
    }

    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Bot ${this.username}: Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts}) en ${this.reconnectDelay/1000} segundos...`);
            
            setTimeout(() => {
                this.authenticateAndConnect();
            }, this.reconnectDelay);
        } else {
            console.error(`Bot ${this.username}: Máximo número de reintentos alcanzado. Deteniendo bot.`);
        }
    }

    initializeSocketEvents(token) {
        this.socket.on("connect", () => {
            console.log(`Bot ${this.username}: Conectado. Realizando login...`);
            this.login(token);
        });

        this.socket.on(ResponseSocketsEnum.LOGIN_SUCCESS, (data) => {
            this.socket.user = data.user;
            
            // Añadir el JWT token al usuario después de un pequeño delay
            setTimeout(() => {
                const user = ConnectedUsersCollection.getBySocketId(this.socket.id);
                if (user && this.jwtToken) {
                    user.addAuthJwt(this.jwtToken);
                    console.log(`Bot ${this.username}: JWT token añadido al usuario`);
                } else {
                    console.log(`Bot ${this.username}: No se pudo añadir JWT token - user: ${!!user}, token: ${!!this.jwtToken}`);
                }
            }, 100); // Pequeño delay para asegurar que el usuario esté registrado
            
            this.socket.emit(RequestSocketsEnum.GET_PUBLIC_SCENES);
            setTimeout(() => {
                this.socket.emit(RequestSocketsEnum.MINIGAME_SUBSCRIBE, {
                    type: 1,
                });
            }, 5000); // Espera 5 segundos antes de unirse al minijuego
        });

        this.socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES, (publicScenes) => {
            setInterval(() => {
                const user = ConnectedUsersCollection.getBySocketId(this.socket.id);
                if (!user || !user.currentArea) {
                    this.joinArea(publicScenes[0].uuid);
                }
            }, 1000);

            this.moveRandomly();
            //this.sendRandomMessage();
            this.selectUser();
        });

        this.socket.on(ResponseSocketsEnum.GET_PUBLIC_SCENE_USERS, (data) => {
            clearInterval(this.uppercutInterval);
            // Encuentra la información del jugador local (el que hace la petición)
            const localUser = data.players.find((player) => player.id === this.socket.id);
            if (!localUser) return; // si no se encontró el jugador local, salimos

            // Función auxiliar para calcular la distancia entre dos jugadores
            // asumiendo que cada player tiene x, y, z.
            const distancia = (p1, p2) => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            };

            // Filtramos al jugador local y reducimos para encontrar al más cercano
            let usuarioMasCercano = null;
            let menorDistancia = Infinity;

            data.players
                .filter((player) => player.id !== this.socket.id)
                .forEach((player) => {
                    const dist = distancia(localUser, player);
                    if (dist < menorDistancia) {
                        menorDistancia = dist;
                        usuarioMasCercano = player;
                    }
                });

            // Si encontramos a un usuario más cercano, lanzamos la acción
            if (usuarioMasCercano) {
                this.socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
                    socketId: usuarioMasCercano.id
                });
                this.uppercutInterval = setInterval(() => {
                    this.socket.emit(RequestSocketsEnum.USER_SEND_UPPERCUT);
                }, 100);
            }
        });

        this.socket.on(ResponseSocketsEnum.MINIGAME_ALERT, (data) => {
            console.log('\x1b[33m%s\x1b[0m', `Bot ${this.username} recibió alerta: ${data.alertType} - ${data.winnerName}`);
            setTimeout(() => {
                console.log(`Bot ${this.username} se suscribe nuevamente al minijuego.`);
                this.socket.emit(RequestSocketsEnum.MINIGAME_SUBSCRIBE, {
                    type: 1,
                });
            }, 20000); // Espera 8 segundos antes de unirse al minijuego
        });

        this.socket.on("disconnect", (data) => {
            console.error(`Bot ${this.username} desconectado. Motivo: ${data}`);
            this.cleanup();
            
            // Intentar reconectar después de un delay
            setTimeout(() => {
                console.log(`Bot ${this.username}: Intentando reconectar...`);
                this.authenticateAndConnect();
            }, this.reconnectDelay);
        });

        this.socket.on("error_critical", () => {
            console.error(`Bot ${this.username}: Error crítico recibido. Desconectando...`);
            this.cleanup();
            this.socket.disconnect();
        });

        this.socket.on(ResponseSocketsEnum.LOGIN_ERROR, (data) => {
            console.error(`Bot ${this.username}: Error de login - ${data.message}`);
            this.cleanup();
            this.socket.disconnect();
        });
    }

    sendRandomMessage() {
        const messages = [
            "¡Hola a todos!",
            "¿Cómo están?",
            "¿Alguien quiere jugar?",
            "¡Buena partida!",
            "Vamos a explorar juntos.",
            "¿Necesitas ayuda?",
            "¡Esto es divertido!",
            "¿Quién quiere un reto?"
        ];

        const sendMessage = () => {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.socket.emit(RequestSocketsEnum.USER_SEND_CHAT, { message: randomMessage, recipient: null, });

            // Generar un tiempo aleatorio entre 5 y 20 segundos
            const randomTime = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;

            setTimeout(sendMessage, 1000);
        };

        sendMessage();
    }

    selectUser() {
        setInterval(() => {
            const user = ConnectedUsersCollection.getBySocketId(this.socket.id);
            if (!user || !user.currentArea) {
                return;
            }
            this.socket.emit(RequestSocketsEnum.GET_PUBLIC_SCENE_USERS, {});
        }, 10000);
    }

    login(token) {
        this.socket.emit(RequestSocketsEnum.LOGIN, { 
            username: this.username, 
            password: null, // Los bots no necesitan password
            bot_token: token 
        });
    }

    moveRandomly() {
        // Intervalos de tiempo aleatorios
        const arrayInterval = [2000, 3000, 5000, 8000];

        const moveInterval = setInterval(() => {
            const user = ConnectedUsersCollection.getBySocketId(this.socket.id);
            if (!user || !user.currentArea) {
                console.log('\x1b[31m' + "Usuario o área no encontrados: " + this.socket.user.username + '\x1b[0m');
                return;
            }

            // Obtener el mapa del área actual
            const sceneModel = user.currentArea;
            const gameMap = sceneModel.game_map; // Asumiendo que game_map está accesible


            // Recoger todas las posiciones válidas (0 = walkable)
            const validPositions = [];
            for (let y = 0; y < gameMap.length; y++) {
                for (let x = 0; x < gameMap[y].length; x++) {
                    if (gameMap[y][x] === 0) { // 0 = posición walkable
                        validPositions.push({ x, y });
                    }
                }
            }

            if (validPositions.length === 0) {
                console.error("No hay posiciones válidas");
                return;
            }

            // Seleccionar posición aleatoria válida
            const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)];
            this.socket.emit(RequestSocketsEnum.USER_MOVE, {
                x: randomPos.x,
                y: randomPos.y
            });

        }, arrayInterval[Math.floor(Math.random() * arrayInterval.length)]);
    }

    joinArea(sceneUuid) {
        this.socket.emit(RequestSocketsEnum.JOIN_PUBLIC_SCENE, { sceneUuid: sceneUuid, menuType: 1 });
    }

    cleanup() {
        if (this.uppercutInterval) {
            clearInterval(this.uppercutInterval);
            this.uppercutInterval = null;
        }
        
        // Limpiar otros intervalos si los hay
        // Esto previene memory leaks
        console.log(`Bot ${this.username}: Limpieza de recursos completada.`);
    }

    destroy() {
        this.cleanup();
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        console.log(`Bot ${this.username}: Bot destruido completamente.`);
    }
}

module.exports = Bot;