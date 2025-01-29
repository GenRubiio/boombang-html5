import AvatarEnum from "../enums/AvatarEnum";
import AvatarBoomerLoad from "./avatars/AvatarBoomerLoad";
import AvatarBrujitaLoad from "./avatars/AvatarBrujitaLoad";
import AvatarCholoLoad from "./avatars/AvatarCholoLoad";
import AvatarEmpollonLoad from "./avatars/AvatarEmpollonLoad";
import AvatarGataLoad from "./avatars/AvatarGataLoad";
import AvatarGhostLoad from "./avatars/AvatarGhostLoad";
import AvatarIndiaLoad from "./avatars/AvatarIndiaLoad";
import AvatarLilianLoad from "./avatars/AvatarLilianLoad";
import AvatarMarsuLoad from "./avatars/AvatarMarsuLoad";
import AvatarModernLoad from "./avatars/AvatarModernLoad";
import AvatarNinjaLoad from "./avatars/AvatarNinjaLoad";
import AvatarRastaLoad from "./avatars/AvatarRastaLoad";
import AvatarSkeletonLoad from "./avatars/AvatarSkeletonLoad";
import AvatarWerewolfLoad from "./avatars/AvatarWerewolfLoad";
import AvatarWraithLoad from "./avatars/AvatarWraithLoad";
import AvatarYayoLoad from "./avatars/AvatarYayoLoad";
import AvatarZombieLoad from "./avatars/AvatarZombieLoad";

class AvatarAnimationsLoad {
    /**
     * Método principal que se llama en el "preload" de tu escena.
     * Aquí cargamos todos los ficheros atlas (spritesheet + JSON)
     * definidos en werewolf_config.
     */
    static preload(gameScene) {
        AvatarBoomerLoad.main(gameScene);
        AvatarBrujitaLoad.main(gameScene);
        AvatarCholoLoad.main(gameScene);
        AvatarEmpollonLoad.main(gameScene);
        AvatarGataLoad.main(gameScene);
        AvatarGhostLoad.main(gameScene);
        AvatarIndiaLoad.main(gameScene);
        AvatarLilianLoad.main(gameScene);
        AvatarMarsuLoad.main(gameScene);
        AvatarModernLoad.main(gameScene);
        AvatarNinjaLoad.main(gameScene);
        AvatarRastaLoad.main(gameScene);
        AvatarSkeletonLoad.main(gameScene);
        AvatarWerewolfLoad.main(gameScene);
        AvatarWraithLoad.main(gameScene);
        AvatarYayoLoad.main(gameScene);
        AvatarZombieLoad.main(gameScene);
    }

    /**
     * Método que se llama en el "create" de tu escena.
     * Aquí creamos las animaciones a partir de los atlases ya cargados.
     */
    static create(gameScene) {
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.BOOMER], AvatarEnum.BOOMER);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.BRUJITA], AvatarEnum.BRUJITA);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.CHOLO], AvatarEnum.CHOLO);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.EMPOLLON], AvatarEnum.EMPOLLON);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.GATA], AvatarEnum.GATA);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.GHOST], AvatarEnum.GHOST);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.INDIA], AvatarEnum.INDIA);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.LILIAN], AvatarEnum.LILIAN);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.MARSU], AvatarEnum.MARSU);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.MODERN], AvatarEnum.MODERN);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.NINJA], AvatarEnum.NINJA);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.RASTA], AvatarEnum.RASTA);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.SKELETON], AvatarEnum.SKELETON);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.WEREWOLF], AvatarEnum.WEREWOLF);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.WRAITH], AvatarEnum.WRAITH);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.YAYO], AvatarEnum.YAYO);
        this.createAvatarAnimations(gameScene, window.avatars_config[AvatarEnum.ZOMBIE], AvatarEnum.ZOMBIE);
    }

    /**
     * Crea las animaciones en Phaser usando la info de frames, framerate y repeat del config.
     *
     * @param {Phaser.Scene} gameScene - La escena de Phaser donde se crean las animaciones.
     * @param {Object} config          - werewolf_config.
     * @param {String} avatarId        - p.e. AvatarEnum.WEREWOLF.
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
