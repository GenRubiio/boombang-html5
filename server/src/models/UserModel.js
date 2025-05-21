const UppercutsEnum = require('../enums/UppercutsEnum');
class UserModel {
    constructor(row) {
        this.id = row.id.toString();
        this.username = row.username;
        this.email = row.email;
        this.avatarId = row.avatar_id; // ID del avatar del usuarioio
        this.uppercutsSend = row.uppercuts_sent;
        this.uppercutsReceived = row.uppercuts_received;

        this.socket = null; // Socket del usuario
        this.currentArea = null; // Área actual del usuario
        this.currentAreaPosition = { x: null, y: null, z: null }; // Posición actual del usuario en el área
        this.selectedUser = null; // Usuario seleccionado por el usuario
        this.movementBlocked = false; // Indica si el movimiento está bloqueado

        this.uppercutLevel = this.calculateUppercutLevel(); // Nivel del uppercut
        this.uppercutSelected = this.uppercutLevel; // Indica si el usuario ha seleccionado un uppercut

        this.finalTarget = null; // Destino final del usuario

        this.blockedActions = {};
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
        const uppercuts = this.uppercutsSend;

        if (uppercuts >= 2000) {
            return UppercutsEnum.GOLD;
        } else if (uppercuts >= 1000) {
            return UppercutsEnum.BLACK;
        } else if (uppercuts >= 500) {
            return UppercutsEnum.BROWN;
        } else if (uppercuts >= 300) {
            return UppercutsEnum.PURPLE;
        } else if (uppercuts >= 100) {
            return UppercutsEnum.BLUE;
        } else if (uppercuts >= 50) {
            return UppercutsEnum.GREEN;
        } else if (uppercuts >= 25) {
            return UppercutsEnum.ORANGE;
        } else if (uppercuts >= 10) {
            return UppercutsEnum.PINK;
        } else {
            return UppercutsEnum.RED;
        }
    }


    // Método para añadir socket al usuario
    addSocket(socket) {
        this.socket = socket;
    }

    setArea(area) {
        this.currentArea = area;
        this.currentAreaPosition = area ? { ...area.startPosition } : { x: null, y: null, z: null };
        this.finalTarget = null;
        this.movementBlocked = false;
        this.blockedActions = {};

        if (!area) {
            this.setSelectedUser(null);
        }
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
