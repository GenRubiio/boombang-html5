const UppercutsEnum = require('../enums/UppercutsEnum');
const CoconutsEnum = require('../enums/CoconutsEnum');
const UserCatalogItemModel = require('./UserCatalogItemModel'); // Importar el modelo de UserCatalogItem
class UserModel {
    constructor(row) {
        this.id = row.id.toString();
        this.username = row.username;
        this.lang = row.lang;
        this.description = row.description;
        this.ficha_color = row.ficha_color; // Ficha del usuario, por defecto es 'user'
        this.shadow_color = row.shadow_color; // Color de sombra del usuario, por defecto es 'user'
        this.chat_color = row.chat_color; // Color del chat del usuario, por defecto es
        this.name_color = row.name_color; // Color del nombre del usuario, por defecto es 'user'
        this.email = row.email;
        this.avatarId = row.avatar_id; // ID del avatar del usuario
        this.goldCoins = row.gold_coins; // Monedas de oro del usuario
        this.silverCoins = row.silver_coins; // Monedas de plata del usuario
        this.ringsWon = row.rings_won; // Anillos ganados por el usuario
        this.coconutsCaught = row.coconuts_caught; // Cocos atrapados por el usuario
        this.uppercutsSend = row.uppercuts_sent; // Uppercuts enviados por el usuario
        this.uppercutsReceived = row.uppercuts_received; // Uppercuts recibidos por el usuario
        this.coconutsSent = row.coconuts_sent; // Cocos enviados por el usuario
        this.coconutsReceived = row.coconuts_received; // Cocos recibidos por el usuario
        this.is_bot = row.is_bot || 0; // Indica si el usuario es un bot

        this.last_update_username_at = row.last_update_username_at;
        this.phaser_rendering_type = row.phaser_rendering_type;
        this.phaser_antialias = row.phaser_antialias;
        this.phaser_antialias_gl = row.phaser_antialias_gl;
        this.phaser_pixel_art = row.phaser_pixel_art;
        this.phaser_round_pixels = row.phaser_round_pixels;
        this.phaser_power_preference = row.phaser_power_preference;
        this.phaser_scene_sound_volume = row.phaser_scene_sound_volume;
        this.phaser_scene_sound_muted = row.phaser_scene_sound_muted;

        this.fichas = row.fichas || []; // Fichas del usuario, por defecto es un array vacío
        this.chats = row.chats || []; // Colores del chat del usuario, por defecto es un array vacío
        this.shadows = row.shadows || []; // Colores de sombra del usuario, por defecto es un array vacío
        this.colornames = row.colornames || []; // Colores de nombre del usuario, por defecto es un array vacío
        this.avatars = row.avatars || []; // Avatares del usuario, por defecto es un array vacío

        this.socket = null; // Socket del usuario
        this.authJwt = null; // JWT de autenticación del usuario
        this.currentArea = null; // Área actual del usuario
        this.currentAreaPosition = { x: null, y: null, z: null }; // Posición actual del usuario en el área
        this.selectedUser = null; // Usuario seleccionado por el usuario
        this.movementBlocked = false; // Indica si el movimiento está bloqueado

        this.uppercutLevel = this.calculateUppercutLevel(); // Nivel del uppercut
        this.uppercutSelected = this.uppercutLevel; // Indica si el usuario ha seleccionado un uppercut

        this.coconutLevel = this.calculateCoconutLevel(); // Nivel del coco
        this.coconutSelected = this.coconutLevel; // Indica si el usuario ha seleccionado un coco

        this.finalTarget = null; // Destino final del usuario

        this.blockedActions = {};

        this.inventory = []; // Inventario del usuario

        this.adminTools = {
            show_isomap: false,
            show_object_reserved_tiles: false,
        };
    }

    // Bloquea una acción específica durante 'duration' ms
    // Opcionalmente, puedes pasar un callback a ejecutar cuando finalice el bloqueo
    blockAction(actionType, duration, callback = null) {
        // Si ya estaba bloqueada, limpiamos el anterior timeout
        if (this.blockedActions[actionType]?.timeoutId) {
            clearTimeout(this.blockedActions[actionType].timeoutId);
        }

        const until = Date.now() + duration;
        const timeoutId = setTimeout(() => {
            this.unblockAction(actionType);
            if (typeof callback === 'function') {
                callback();
            }
        }, duration);

        this.blockedActions[actionType] = { until, timeoutId, callback };
        return timeoutId;
    }

    // Quita el bloqueo de una acción
    unblockAction(actionType) {
        if (this.blockedActions[actionType]) {
            // Limpiamos el timeout por si no se ejecutó aún
            if (this.blockedActions[actionType].timeoutId) {
                clearTimeout(this.blockedActions[actionType].timeoutId);
            }
            delete this.blockedActions[actionType];
        }
    }

    // Verifica si la acción está bloqueada
    isActionBlocked(actionType) {
        const action = this.blockedActions[actionType];
        if (!action) return false;
        if (Date.now() > action.until) {
            // Ya se cumplió el tiempo, desbloquear y return false
            this.unblockAction(actionType);
            return false;
        }
        return true;
    }

    calculateUppercutLevel() {
        const ringsWon = this.ringsWon;
        if (ringsWon >= 30000) {
            return UppercutsEnum.GOLD;
        } else if (ringsWon >= 10000) {
            return UppercutsEnum.BLACK;
        } else if (ringsWon >= 5000) {
            return UppercutsEnum.BROWN;
        } else if (ringsWon >= 2000) {
            return UppercutsEnum.PURPLE;
        } else if (ringsWon >= 1000) {
            return UppercutsEnum.WHITE;
        } else if (ringsWon >= 500) {
            return UppercutsEnum.BLUE;
        } else if (ringsWon >= 250) {
            return UppercutsEnum.GREEN;
        } else if (ringsWon >= 100) {
            return UppercutsEnum.ORANGE;
        } else if (ringsWon >= 10) {
            return UppercutsEnum.PINK;
        } else {
            return UppercutsEnum.RED;
        }
    }

    calculateCoconutLevel() {
        const coconutsCaught = this.coconutsCaught;
        if (coconutsCaught >= 10000) {
            return CoconutsEnum.PIANO;
        } else if (coconutsCaught >= 6665) {
            return CoconutsEnum.YUNQUE;
        } else if (coconutsCaught >= 5000) {
            return CoconutsEnum.SANDIA;
        } else if (coconutsCaught >= 3335) {
            return CoconutsEnum.GARBAGE;
        } else if (coconutsCaught >= 2500) {
            return CoconutsEnum.AVISPAS;
        } else if (coconutsCaught >= 1665) {
            return CoconutsEnum.MACETA;
        } else if (coconutsCaught >= 835) {
            return CoconutsEnum.PIE;
        } else if (coconutsCaught >= 335) {
            return CoconutsEnum.SHOE;
        } else if (coconutsCaught >= 165) {
            return CoconutsEnum.SNOWBALL;
        } else {
            return CoconutsEnum.COCO;
        }
    }


    // Método para añadir socket al usuario
    addSocket(socket) {
        this.socket = socket;
    }

    //Metodo para añadir JWT de autenticación al usuario
    addAuthJwt(jwt) {
        this.authJwt = jwt;
    }

    setArea(area) {
        this.currentArea = area;
        this.currentAreaPosition = area ? { ...area.startPosition } : { x: null, y: null, z: null };
        this.finalTarget = null;
        this.movementBlocked = false;
        this.blockedActions = {};

        if (!area) {
            this.setSelectedUser(null);

            if (this._uppercutTimeout) {
                clearTimeout(this._uppercutTimeout);
                delete this._uppercutTimeout;
            }
        }
    }

    setInventory(items) {
        this.inventory = items.map(item => new UserCatalogItemModel(item));
    }

    setSelectedUser(user) {
        this.selectedUser = user;
    }

    inMoviment() {
        return this.finalTarget !== null;
    }

    // Cancelar cualquier movimiento anterior
    cancelMovement() {
        if (this.currentArea && this.lastReservedTile) {
            delete this.currentArea.reservedTiles[this.lastReservedTile];
        }
        this.finalTarget = null;
    }

    // Establecer el destino final
    setFinalTarget(target) {
        this.finalTarget = target;
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }
}

module.exports = UserModel;
