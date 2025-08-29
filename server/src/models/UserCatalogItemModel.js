class UserCatalogItemModel {
    constructor(row) {
        this.id = row.id;
        this.private_scene_id = row.private_scene_id; // ID de la escena a la que pertenece el objeto
        this.display_name = row.display_name;
        this.sprite_name = row.sprite_name;
        this.map_size = JSON.parse(row.map_size); // Tamaño del mapa del objeto map_size: [[0, 1], [1, 2], [2, 1], [1, 0], [1, 1]],
        this.occupied_tiles = JSON.parse(row.occupied_tiles); // Casillas ocupadas por el objeto  //occupied_tiles: [[11, 10], [12, 11], [11, 12], [10, 11], [11, 11]],
        this.image = row.image;
        this.image_url = row.image_url;
        this.spreadsheet = row.spreadsheet;
        this.spreadsheet_url = row.spreadsheet_url;
        this.atlas = row.atlas;
        this.atlas_url = row.atlas_url;
        this.width = row.width;
        this.height = row.height;
    }
}

module.exports = UserCatalogItemModel; 