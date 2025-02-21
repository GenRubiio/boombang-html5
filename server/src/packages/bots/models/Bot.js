const { io } = require("socket.io-client");
require('dotenv').config();
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class Bot {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.socket = io(process.env.EMULATOR_URL);
        this.uppercutInterval = null;

        this.socket.on("connect", () => {
            //console.log(`${this.username} conectado como bot.`);
            this.login();
        });

        this.socket.on("login_success", (data) => {
            setInterval(() => {
                this.joinArea(1);
            }, 1000);

            this.moveRandomly();
            this.selectUser();
        });

        this.socket.on(ResponseSocketsEnum.GET_PUBLIC_AREA_USERS, (data) => {
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
                    this.socket.emit(RequestSocketsEnum.SEND_UPPERCUT);
                }, 100);
            }
        });

        this.socket.on("disconnect", () => {
            console.log(`${this.username} desconectado.`);
        });

        this.socket.on("error_critical", () => {
            this.socket.disconnect();
        });
    }

    selectUser() {
        setInterval(() => {
            this.socket.emit(RequestSocketsEnum.GET_PUBLIC_AREA_USERS, {});
        }, 10000);
    }

    login() {
        this.socket.emit("login", { username: this.username, password: this.password });
    }

    moveRandomly() {
        setInterval(() => {
            const x = Math.floor(Math.random() * 30);
            const y = Math.floor(Math.random() * 30);
            this.socket.emit(RequestSocketsEnum.USER_MOVE, { x: x, y: y });
        }, 3000); // Se mueve cada 3 segundos
    }

    joinArea(areaId) {
        this.socket.emit(RequestSocketsEnum.JOIN_PUBLIC_AREA, { areaId: areaId });
    }
}

module.exports = Bot;