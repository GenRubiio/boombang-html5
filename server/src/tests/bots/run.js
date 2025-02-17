const { io } = require("socket.io-client");
console.log('Bots corriendo...');

class Bot {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.socket = io('http://localhost:3000');

        this.socket.on("connect", () => {
            console.log(`${this.username} conectado como bot.`);
            this.login();
        });

        this.socket.on("login_success", (data) => {
            this.joinArea();
            this.startActions();
        });

        this.socket.on("disconnect", () => {
            console.log(`${this.username} desconectado.`);
        });
    }

    login() {
        this.socket.emit("login", { username: this.username, password: this.password });
    }

    moveRandomly() {
        const x = Math.floor(Math.random() * 30);
        const y = Math.floor(Math.random() * 30);
        this.socket.emit("request:user_move", { x: x, y: y });
        console.log(`Moviendo a ${this.username} a (${x}, ${y})`);
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

new Bot('bot1', 'test');
new Bot('bot2', 'test');
new Bot('bot3', 'test');
new Bot('bot4', 'test');
new Bot('bot5', 'test');
new Bot('bot6', 'test');
new Bot('bot7', 'test');
new Bot('bot8', 'test');
new Bot('bot9', 'test');
new Bot('bot10', 'test');
new Bot('bot11', 'test');
console.log('Bots creados.');