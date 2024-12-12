class UserModel {
    constructor(row) {
        this.id = row.id.toString();
        this.username = row.name;
        this.email = row.email;
        this.avatarId = row.avatar_id; // ID del avatar del usuario
        this.avatarColors = row.avatar_colors; // Colores del avatar del usuario

        this.socket = null; // Socket del usuario
        this.currentArea = null; // Área actual del usuario
        this.currentAreaPosition = { x: null, y: null, z: null }; // Posición actual del usuario en el área
        this.selectedUser = null; // Usuario seleccionado por el usuario

        this.finalTarget = null; // Destino final del usuario
    }

    // Método para añadir socket al usuario
    addSocket(socket) {
        this.socket = socket;
    }

    setArea(area) {
        this.currentArea = area;
        this.currentAreaPosition = area ? area.startPosition : { x: null, y: null, z: null };
        this.finalTarget = null;
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
