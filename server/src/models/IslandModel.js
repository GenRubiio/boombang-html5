class IslandModel {
    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.description = row.description;
        this.type = row.type;
        this.is_uppercut_active = row.is_uppercut_active;
        this.user_id = row.user_id;
    }
}

module.exports = IslandModel; 