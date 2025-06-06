class MinigameSceneModel {
    constructor(row) {
        this.id = row.id;
        this.type = row.type;
        this.name = row.name;
        this.mapWidth = row.map_width;
        this.mapHeight = row.map_height;
        this.gameMap = JSON.parse(row.map);
        this.startPosition = row.start_position;
        this.navigationMapBase = JSON.parse(row.map);
        this.positionUsers = JSON.parse(row.position_users);
    }
}

module.exports = MinigameSceneModel; 