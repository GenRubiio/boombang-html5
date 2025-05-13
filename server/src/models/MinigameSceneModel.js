class MinigameSceneModel {
    constructor(row) {
        this.id = row.id;
        this.type = row.type;
        this.name = row.name;
        this.map_width = row.map_width;
        this.map_height = row.map_height;
        this.game_map = JSON.parse(row.map);
        this.startPosition = row.start_position;
        this.navigationMapBase = JSON.parse(row.map);
        this.position_users = JSON.parse(row.position_users);
    }
}

module.exports = MinigameSceneModel; 