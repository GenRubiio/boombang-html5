class UserCatalogItemModel {
    constructor(row) {
        this.id = row.id;
        this.display_name = row.display_name;
        this.sprite_name = row.sprite_name;
        this.map_size = JSON.parse(row.map_size); // Tamaño del mapa del objeto
        this.occupied_tiles = JSON.parse(row.occupied_tiles); // Casillas ocupadas por el objeto
    }
}

module.exports = UserCatalogItemModel; 