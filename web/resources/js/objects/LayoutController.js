import Utils from "../helpers/UtilsHelper.js";

const LayoutController = {
    modal: {
        closeEl: '.modal-close-button',
        containerEl: '#modal-container',
    },

    init() {
        this.setListeners();
    },

    setListeners() {
        if (Utils.checkSection(this.modal.closeEl)) {
            document
                .querySelector(this.modal.closeEl)
                .addEventListener('click', (ev) => this.closeModal(ev));
            document
                .querySelector(this.modal.containerEl)
                .addEventListener('click', (ev) => this.closeModal(ev));
        }
    },

    closeModal(ev) {
        if (ev.target === ev.currentTarget) {
            Utils.hideModal();
        }
    },
};

export default LayoutController;
