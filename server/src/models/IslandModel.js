class IslandModel {
    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.description = row.description;
        this.type = row.type;
        this.isUppercutActive = row.is_uppercut_active;
        this.userId = row.user_id;
        this.countUsers = 0;
        this.scenes = row.scenes || [];
        this.myIsland = row.my_island || false; // Default to false if not provided
    }
}

module.exports = IslandModel; 