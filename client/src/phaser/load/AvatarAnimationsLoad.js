import werewolf_config from "../../assets/game/avatars/1/config.json";
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
        Object.entries(config).forEach(([animationName, animData]) => {
            const animKey = `${avatarId}_${animationName}`;
            const atlasKey = animData.atlasKey;

            gameScene.anims.create({
                key: animKey,
                frames: gameScene.anims.generateFrameNames(atlasKey, {
                    start: animData.start,
                    end: animData.end,
                    prefix: animData.prefix
                }),
                frameRate: animData.frameRate,
                repeat: animData.repeat
            });
        });
    }
}

export default AvatarAnimationsLoad;
