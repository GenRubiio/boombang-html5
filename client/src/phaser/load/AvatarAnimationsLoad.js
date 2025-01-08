import werewolf_config from "../../assets/game/avatars/1/werewolf-config.json";
import AvatarsEnum from "../enums/AvatarsEnum";
import AvatarWerewolfLoad from "./avatars/AvatarWerewolfLoad";

class AvatarAnimationsLoad {
    /**
     * Método principal que se llama en el "preload" de tu escena.
     * Aquí cargamos todos los ficheros atlas (spritesheet + JSON)
     * definidos en werewolf_config.
     */
    static preload(gameScene) {
        AvatarWerewolfLoad.main(gameScene);
    }

    /**
     * Método que se llama en el "create" de tu escena.
     * Aquí creamos las animaciones a partir de los atlases ya cargados.
     */
    static create(gameScene) {
        this.createAvatarAnimations(gameScene, werewolf_config, AvatarsEnum.WEREWOLF);
    }


    /**
     * Crea las animaciones en Phaser usando la info de frames, framerate y repeat del config.
     *
     * @param {Phaser.Scene} gameScene - La escena de Phaser donde se crean las animaciones.
     * @param {Object} config          - werewolf_config.
     * @param {String} avatarId        - p.e. AvatarsEnum.WEREWOLF.
     */
    static createAvatarAnimations(gameScene, config, avatarId) {
        Object.entries(config).forEach(([animationName, animationData]) => {
            const animationKey = `${avatarId}_${animationName}`;
            const atlasKey = `${avatarId}_${animationData.spritesheet}`;

            // Creación de la animación en Phaser
            gameScene.anims.create({
                key: animationKey,
                frames: gameScene.anims.generateFrameNames(atlasKey, {
                    // Buscamos frames "1", "2", "3", ..., según "start" y "end"
                    start: animationData.frames.start,
                    end: animationData.frames.end
                }),
                frameRate: animationData.frameRate,
                repeat: animationData.repeat
            });
        });
    }
}

export default AvatarAnimationsLoad;
