const { io } = require("socket.io-client");
require('dotenv').config();
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class Bot {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.socket = io(process.env.EMULATOR_URL);
        this.uppercutInterval = null;

        this.socket.on("connect", () => {
            this.login();
        });

        this.socket.on(ResponseSocketsEnum.LOGIN_SUCCESS, (data) => {
            this.socket.user = data.user;
            this.socket.emit(RequestSocketsEnum.GET_PUBLIC_SCENES);
            this.socket.emit(RequestSocketsEnum.MINIGAME_SUBSCRIBE, {
                type: 1,
            });
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
            console.log('\x1b[33m%s\x1b[0m', `Bot ${this.username} recibió alerta: ${data.alertType}`);
            setTimeout(() => {
                this.socket.emit(RequestSocketsEnum.MINIGAME_SUBSCRIBE, {
                    type: 1,
                });
            }, 8000); // Espera 8 segundos antes de unirse al minijuego
        });

        this.socket.on("disconnect", (data) => {
            console.error(`Bot ${this.username} desconectado. Motivo: ${data}`);
            console.log(`${this.username} desconectado.`);
        });

        this.socket.on("error_critical", () => {
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
            this.socket.emit(RequestSocketsEnum.USER_SEND_CHAT, { message: randomMessage });

            // Generar un tiempo aleatorio entre 5 y 20 segundos
            const randomTime = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;

            setTimeout(sendMessage, randomTime);
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

    login() {
        this.socket.emit(RequestSocketsEnum.LOGIN, { username: this.username, password: this.password });
    }

    moveRandomly() {
        // Intervalos de tiempo aleatorios
        const arrayInterval = [2000, 3000, 5000, 8000];

        const moveInterval = setInterval(() => {
            const user = ConnectedUsersCollection.getBySocketId(this.socket.id);
            if (!user || !user.currentArea) {
                console.log('\x1b[31m' + "Usuario o área no encontrados: " + this.socket.user.username + " - " + user + '\x1b[0m');
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
}

module.exports = Bot;