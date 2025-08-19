class SceneItemModel {
    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.file_name = row.file_name;
        this.catch_file_name = row.catch_file_name;
        this.points = row.points;
        this.text = row.text;
        this.activate_time = row.activate_time; // Tiempo de espera para aparecer (segundos)
        this.desactivate_time = row.desactivate_time; // Tiempo de espera para desaparecer (segundos)
        this.min_users = row.min_users;
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = SceneItemModel; 