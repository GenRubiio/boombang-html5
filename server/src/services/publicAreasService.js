const publicAreasCollection = require('../collections/publicAreasCollection');

const getAll = async () => {
    return publicAreasCollection.getAll();
};

module.exports = {
    getAll,
};
