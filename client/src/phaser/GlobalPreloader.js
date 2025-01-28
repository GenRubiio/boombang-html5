// phaser/GlobalPreloaderScene.js
import Phaser from "phaser";
import AvatarAnimationsLoad from "./load/AvatarAnimationsLoad";
// ...otros assets que quieras precargar globalmente

export default class GlobalPreloader extends Phaser.Scene {
    constructor() {
        super("GlobalPreloader");
    }

    preload() {
        // Cargar animaciones de avatar
        AvatarAnimationsLoad.preload(this);

        // ...carga aquí TODO lo que se use en distintas escenas
    }

    create() {
        // Si necesitas crear las animaciones inmediatamente:
        AvatarAnimationsLoad.create(this);

        // Al terminar, pasas a otra escena o quedas en espera
        // Por ejemplo, inicias la escena de “Lobby” de Phaser
        // Si la tienes como escena, sería:
        // this.scene.start("LobbyPhaserScene");
        // O bien puedes quedarte quieto si no usas Phaser en el Lobby.
    }
}
