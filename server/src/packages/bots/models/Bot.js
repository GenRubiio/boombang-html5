const { io } = require("socket.io-client");
require('dotenv').config();

class Bot {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.socket = io(process.env.EMULATOR_URL);
        this.uppercutInterval = null;

        this.socket.on("connect", () => {
            console.log(`${this.username} conectado como bot.`);
            this.login();
        });

        this.socket.on("login_success", (data) => {
            setInterval(() => {
                this.joinArea();
            }, 3000);

            this.startActions();
            this.selectUser();
        });

        this.socket.on("response:get_public_area_users", (data) => {
            clearInterval(this.uppercutInterval);
            const randomUser = data.players[Math.floor(Math.random() * data.players.length)];
            if (randomUser.id !== this.socket.id) {
                this.socket.emit('request:user_select_user', {
                    socketId: randomUser.id
                });
                this.uppercutInterval = setInterval(() => {
                    this.socket.emit('request:send_uppercut');
                }, 100);
            }
        });

        this.socket.on("disconnect", () => {
            console.log(`${this.username} desconectado.`);
        });
    }

    selectUser() {
        setInterval(() => {
            this.socket.emit("request:get_public_area_users", {});
        }, 10000);
    }

    login() {
        this.socket.emit("login", { username: this.username, password: this.password });
    }

    moveRandomly() {
        const x = Math.floor(Math.random() * 30);
        const y = Math.floor(Math.random() * 30);
        this.socket.emit("request:user_move", { x: x, y: y });
        //console.log(`Moviendo a ${this.username} a (${x}, ${y})`);
    }

    startActions() {
        setInterval(() => {
            this.moveRandomly();
        }, 3000); // Se mueve cada 3 segundos
    }

    joinArea() {
        this.socket.emit("request:join_public_area", { areaId: 1 });
    }
}

module.exports = Bot;