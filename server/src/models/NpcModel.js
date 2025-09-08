class NpcModel {
    constructor(row) {
        this.id = row.id;
        this.type = row.type;
        this.stripeName = row.stripe_name;
        this.name = row.name;
        this.description = row.description;
        this.image = row.image;
        this.positionX = row.position_x;
        this.positionY = row.position_y;
        this.depth = row.depth;
        this.active = row.active;
    }
}

module.exports = NpcModel; 