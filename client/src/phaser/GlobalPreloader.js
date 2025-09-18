// phaser/GlobalPreloaderScene.js
import Phaser from "phaser";
import AvatarAnimationsLoad from "./load/AvatarAnimationsLoad";
import EffectAnimationsLoad from "./load/EffectAnimationsLoad";
import AvatarSystemController from "./controllers/AvatarSystemController.js";

export default class GlobalPreloader extends Phaser.Scene {
    constructor() {
        super("GlobalPreloader");
    }

    preload() {
        // Cargar animaciones de avatar
        AvatarAnimationsLoad.preload(this);
        // Cargar animaciones de efectos
        EffectAnimationsLoad.preload(this);
    }

    async create() {
        //console.log("��� GlobalPreloader iniciando...");
        
        // Crear animaciones inmediatamente si es necesario
        AvatarAnimationsLoad.create(this);
        EffectAnimationsLoad.create(this);

        // IMPORTANTE: Inicializar el sistema de avatares aquí
        try {
            const avatarSystemReady = await AvatarSystemController.init(this);
            
            if (avatarSystemReady) {
                //console.log("✅ Sistema de avatares inicializado en GlobalPreloader");
                this.registry.set('avatarSystemReady', true);
            } else {
                //console.error("❌ Error crítico: Sistema de avatares falló en GlobalPreloader");
                this.registry.set('avatarSystemReady', false);
            }
        } catch (error) {
            //console.error("❌ Error inicializando sistema de avatares:", error);
            this.registry.set('avatarSystemReady', false);
        }

        this.game.events.emit("globalPreloaderComplete");
    }
}
