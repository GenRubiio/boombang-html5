class SceneItemModel {
    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.fileName = row.file_name;
        this.activateTime = row.activate_time; // Tiempo de espera para aparecer (segundos)
        this.desactivateTime = row.desactivate_time; // Tiempo de espera para desaparecer (segundos)
        this.minUsers = row.min_users;
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = SceneItemModel; 