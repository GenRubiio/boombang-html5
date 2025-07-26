import Utils from "../helpers/UtilsHelper.js";

const PlayPageController = {
    attr: {
        page: '#page-play',
    },

    init() {
        if (Utils.checkSection(this.attr.page)) {
            this.removeHeader();
            this.setListeners();
        }
    },

    setListeners() {
        
    },

    removeHeader() {
        const header = document.querySelector('header');
        if (header) {
            header.remove();
        }
    }
};

export default PlayPageController;
