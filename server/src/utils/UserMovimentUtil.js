const DirectionEnum = require('../enums/DirectionEnum');

class UserMovimentUtil {
    static getDirection(deltaX, deltaY) {
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

module.exports = UserMovimentUtil;