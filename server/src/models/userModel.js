const DirectionEnum = require('../enums/DirectionEnum');

class UserModel {
    constructor(id, username, email, avatarId) {
        this.id = id.toString();
        this.username = username;
        this.email = email;
        this.socket = null; // Socket del usuario
        this.currentArea = null; // Área actual del usuario
        this.currentAreaPosition = { x: null, y: null, z: null }; // Posición actual del usuario en el área

        this.finalTarget = null; // Destino final del usuario
        this.avatarId = avatarId; // ID del avatar del usuario
    }

    // Método para añadir socket al usuario
    addSocket(socket) {
        this.socket = socket;
    }

    setArea(area) {
        this.currentArea = area;
        this.currentAreaPosition = area ? area.startPosition : { x: null, y: null, z: null };
        this.finalTarget = null;
    }

    // Cancelar cualquier movimiento anterior
    cancelMovement() {
        this.finalTarget = null;
    }

    // Establecer el destino final
    setFinalTarget(target) {
        this.finalTarget = target;
    }

    getDirection(deltaX, deltaY) {
        if (deltaX === 0 && deltaY === 1) return DirectionEnum.DOWN_LEFT;  // Abajo izquierda
        if (deltaX === 1 && deltaY === 1) return DirectionEnum.DOWN; // Abajo
        if (deltaX === 1 && deltaY === 0) return DirectionEnum.DOWN_RIGHT;  // Abajo derecha
        if (deltaX === 1 && deltaY === -1) return DirectionEnum.RIGHT;  // Derecha
        if (deltaX === 0 && deltaY === -1) return DirectionEnum.UP_RIGHT; // Arriba derecha
        if (deltaX === -1 && deltaY === -1) return DirectionEnum.UP;  // Arriba
        if (deltaX === -1 && deltaY === 0) return DirectionEnum.UP_LEFT; // Arriba izquierda
        if (deltaX === -1 && deltaY === 1) return DirectionEnum.LEFT;  // Izquierda
        return DirectionEnum.NONE; // Si no hay movimiento
    }
}

module.exports = UserModel;
