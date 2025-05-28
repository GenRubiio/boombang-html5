class SceneItemModel {
    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.file_name = row.file_name;
        this.time = row.time; // Tiempo de espera para aparecer (segundos)
        this.min_users = row.min_users;
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = SceneItemModel; 