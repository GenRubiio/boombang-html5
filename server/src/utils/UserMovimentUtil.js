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
        return DirectionEnum.DOWN; // Si no hay movimiento
    }

    static getLongDirection(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Si no hay diferencia, sin dirección
        if (dx === 0 && dy === 0) {
            return DirectionEnum.DOWN;
        }

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        // Determinamos el cuadrante:
        // dx > 0 y dy > 0: cuadrante abajo-derecha
        // dx > 0 y dy < 0: cuadrante arriba-derecha
        // dx < 0 y dy > 0: cuadrante abajo-izquierda
        // dx < 0 y dy < 0: cuadrante arriba-izquierda

        // En cada cuadrante elegimos una de las tres direcciones posibles según cuál valor es mayor (absX o absY), o si son iguales.
        if (dx >= 0 && dy >= 0) {
            // Cuadrante abajo-derecha: direcciones posibles: DOWN_LEFT(1), DOWN(2), DOWN_RIGHT(3)
            if (absY > absX) return DirectionEnum.DOWN_LEFT;   // Más vertical => DOWN_LEFT
            else if (absY < absX) return DirectionEnum.DOWN_RIGHT; // Más horizontal => DOWN_RIGHT
            else return DirectionEnum.DOWN; // Igual magnitud => DOWN
        } else if (dx >= 0 && dy <= 0) {
            // Cuadrante arriba-derecha: posibles: UP_RIGHT(5), RIGHT(4), DOWN_RIGHT(3)
            // Ajusta según tus resultados esperados. Por ejemplo:
            if (absY > absX) return DirectionEnum.UP_RIGHT; // Más vertical => UP_RIGHT
            else if (absY < absX) return DirectionEnum.DOWN_RIGHT; // Más horizontal => DOWN_RIGHT
            else return DirectionEnum.RIGHT; // Igual => RIGHT
        } else if (dx <= 0 && dy >= 0) {
            // Cuadrante abajo-izquierda: posibles: DOWN_LEFT(1), LEFT(8), UP_LEFT(7)
            if (absY > absX) return DirectionEnum.DOWN_LEFT;
            else if (absY < absX) return DirectionEnum.UP_LEFT;
            else return DirectionEnum.LEFT;
        } else {
            // Cuadrante arriba-izquierda: posibles: UP(6), UP_LEFT(7), UP_RIGHT(5)
            // Aquí necesitas ajustar según tus test. Por ejemplo:
            if (absY > absX) return DirectionEnum.UP_RIGHT;
            else if (absY < absX) return DirectionEnum.UP_LEFT;
            else return DirectionEnum.UP;
        }
    }

}

module.exports = UserMovimentUtil;