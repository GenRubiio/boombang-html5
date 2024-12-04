class Enum {
    constructor(enumObj) {
        Object.entries(enumObj).forEach(([key, value]) => {
            this[key] = value;
        });
        Object.freeze(this);
    }

    static fromValue(value, enumInstance) {
        for (const key of Object.keys(enumInstance)) {
            if (enumInstance[key] === value) {
                return key;
            }
        }
        throw new Error(`Value ${value} not found in enum`);
    }
}

module.exports = Enum;